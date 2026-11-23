import type {Language} from '../i18n/languages';
import {getAuthHeaders, PublicUser} from './authApi';

export type InquiryStatus = 'new' | 'contacted' | 'booked';
export type InquirySource = 'home' | 'modal' | 'contact';

export interface InquiryRecord {
  id: string;
  name: string;
  phone: string;
  destinationSlug: string;
  destinationLabel: string;
  message: string;
  source: InquirySource;
  lang: Language;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryInput {
  name: string;
  phone: string;
  destinationSlug?: string;
  destinationLabel?: string;
  message?: string;
  source: InquirySource;
  lang: Language;
}

export interface VisitSummary {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visitsCount: number;
  lang: Language;
}

export interface AdminOverview {
  stats: {
    uniqueStarts: number;
    totalStarts: number;
    registeredUsersCount: number;
    ticketsCount?: number;
  };
  recentUsers: PublicUser[];
  recentVisits: VisitSummary[];
}

const VISITOR_STORAGE_KEY = 'horizo_visitor_id';
let startRecordedThisPageLoad = false;

function getOrCreateAnonymousVisitorId(): string {
  const fallbackId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
      return existing;
    }
    window.localStorage.setItem(VISITOR_STORAGE_KEY, fallbackId);
    return fallbackId;
  } catch {
    return fallbackId;
  }
}

export async function recordSiteStart(lang: Language): Promise<void> {
  if (startRecordedThisPageLoad) return;
  startRecordedThisPageLoad = true;
  try {
    const visitorId = getOrCreateAnonymousVisitorId();
    await fetch('/api/analytics/start', {
      method: 'POST',
      headers: getAuthHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({visitorId, lang}),
    });
  } catch {
    // Non-blocking analytics ping; ignore offline failures
  }
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const res = await fetch('/api/admin/overview', {
    credentials: 'same-origin',
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (res.status === 403) {
    throw new Error('FORBIDDEN');
  }
  if (!res.ok) {
    throw new Error('FETCH_FAILED');
  }
  return res.json() as Promise<AdminOverview>;
}

export async function submitInquiry(input: CreateInquiryInput): Promise<InquiryRecord> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    credentials: 'same-origin',
    keepalive: true,
    headers: getAuthHeaders({'Content-Type': 'application/json'}),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {error?: string};
    throw new Error(err.error || 'Failed to submit inquiry.');
  }
  const data = (await res.json()) as {inquiry: InquiryRecord};
  return data.inquiry;
}

export async function fetchInquiries(): Promise<InquiryRecord[]> {
  const res = await fetch('/api/inquiries', {
    credentials: 'same-origin',
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (res.status === 403) {
    throw new Error('FORBIDDEN');
  }
  if (!res.ok) {
    throw new Error('FETCH_FAILED');
  }
  const data = (await res.json()) as {inquiries: InquiryRecord[]};
  return data.inquiries;
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<InquiryRecord> {
  const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: getAuthHeaders({'Content-Type': 'application/json'}),
    body: JSON.stringify({status}),
  });
  if (!res.ok) {
    throw new Error('Failed to update status.');
  }
  const data = (await res.json()) as {inquiry: InquiryRecord};
  return data.inquiry;
}

export async function deleteInquiry(id: string): Promise<void> {
  const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to delete inquiry.');
  }
}
