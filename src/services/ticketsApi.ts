import type {CabinClass} from '../data/flights';
import type {Language} from '../i18n/languages';
import {getAuthHeaders} from './authApi';

export type TicketStatus =
  | 'pending_payment'
  | 'paid'
  | 'issued'
  | 'confirmed'
  | 'cancelled'
  | 'expired';

export interface AiTicketBrief {
  boardingSummary: string;
  checkInNote: string;
  baggageAdvice: string;
  arrivalTip: string;
  preparedByModel: string;
  preparedAt: string;
}

export interface TicketRecord {
  id: string;
  pnrCode: string;
  flightId: string;
  flightNumber: string;
  airline: string;
  originCode: string;
  originCity: string;
  destinationSlug: string;
  destinationCode: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  cabin: CabinClass;
  passengers: number;
  passengerName: string;
  phone?: string;
  passportLast4: string;
  unitPriceUsd: number;
  totalPriceUsd: number;
  lang: Language;
  status: TicketStatus;
  paymentToken?: string;
  paymentExpiresAt: string;
  paidAt?: string;
  aiBrief?: AiTicketBrief;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPaymentStatusResponse {
  pnrCode: string;
  status: TicketStatus;
  paymentExpiresAt: string;
  remainingSeconds: number;
  totalPriceUsd: number;
  airline: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  cabin: CabinClass;
  passengers: number;
  passengerName: string;
  paidAt?: string;
  aiBrief?: AiTicketBrief;
}

export interface IssueTicketInput {
  flightId: string;
  departureDate: string;
  cabin: CabinClass;
  passengers: number;
  passengerName: string;
  phone: string;
  passportNumber?: string;
  lang: Language;
}

export async function reserveFlightTicket(input: IssueTicketInput): Promise<TicketRecord> {
  const res = await fetch('/api/tickets/reserve', {
    method: 'POST',
    credentials: 'same-origin',
    keepalive: true,
    headers: getAuthHeaders({'Content-Type': 'application/json'}),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {error?: string};
    throw new Error(err.error || 'RESERVE_FAILED');
  }
  const data = (await res.json()) as {ticket: TicketRecord};
  return data.ticket;
}

export async function fetchPaymentStatus(
  pnr: string,
  token: string,
): Promise<TicketPaymentStatusResponse> {
  const res = await fetch(
    `/api/tickets/payment/${encodeURIComponent(pnr)}/status?token=${encodeURIComponent(token)}`,
    {credentials: 'same-origin'},
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {error?: string};
    throw new Error(err.error || 'PAYMENT_STATUS_FAILED');
  }
  return res.json() as Promise<TicketPaymentStatusResponse>;
}

export async function confirmTicketPayment(
  pnr: string,
  token: string,
): Promise<{ticket: TicketRecord}> {
  const res = await fetch(`/api/tickets/payment/${encodeURIComponent(pnr)}/confirm`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({token}),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {error?: string; status?: TicketStatus};
    const error = new Error(err.error || 'CONFIRM_FAILED') as Error & {ticketStatus?: TicketStatus};
    error.ticketStatus = err.status;
    throw error;
  }
  return res.json() as Promise<{ticket: TicketRecord}>;
}

export async function verifyTicketByPnr(pnr: string): Promise<TicketRecord> {
  const res = await fetch(`/api/tickets/verify/${encodeURIComponent(pnr)}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {error?: string};
    throw new Error(err.error || 'NOT_FOUND');
  }
  const data = (await res.json()) as {ticket: TicketRecord};
  return data.ticket;
}

export async function fetchTickets(): Promise<TicketRecord[]> {
  const res = await fetch('/api/tickets', {
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
  const data = (await res.json()) as {tickets: TicketRecord[]};
  return data.tickets;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<TicketRecord> {
  const res = await fetch(`/api/tickets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: getAuthHeaders({'Content-Type': 'application/json'}),
    body: JSON.stringify({status}),
  });
  if (!res.ok) {
    throw new Error('Failed to update ticket status.');
  }
  const data = (await res.json()) as {ticket: TicketRecord};
  return data.ticket;
}

export async function deleteTicket(id: string): Promise<void> {
  const res = await fetch(`/api/tickets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to delete ticket.');
  }
}
