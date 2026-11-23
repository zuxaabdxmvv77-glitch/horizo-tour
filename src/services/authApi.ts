export type UserRole = 'user' | 'owner';
export type ContactType = 'phone' | 'email';

export interface PublicUser {
  id: string;
  contactDisplay: string;
  contactType: ContactType;
  role: UserRole;
  createdAt: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user: PublicUser | null;
  token: string | null;
}

// Keep the HMAC-signed session token strictly in module memory (never in localStorage/sessionStorage).
// On page reload, /api/auth/me restores it from the HttpOnly Partitioned cookie when available.
let inMemoryToken: string | null = null;

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Requested-With': 'HorizoTourClient',
    ...extra,
  };
  if (inMemoryToken) {
    headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return headers;
}

export function clearAuthToken(): void {
  inMemoryToken = null;
}

export async function fetchCurrentSession(): Promise<AuthSessionResponse> {
  const res = await fetch('/api/auth/me', {
    credentials: 'same-origin',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    return {authenticated: false, user: null, token: null};
  }
  const data = (await res.json()) as AuthSessionResponse;
  if (data.authenticated && data.token) {
    inMemoryToken = data.token;
  } else {
    inMemoryToken = null;
  }
  return data;
}

export async function registerAccount(
  contact: string,
  password: string,
): Promise<AuthSessionResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'same-origin',
    headers: getAuthHeaders({'Content-Type': 'application/json'}),
    body: JSON.stringify({contact, password}),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<AuthSessionResponse> & {
    error?: string;
  };
  if (!res.ok || !data.authenticated || !data.user) {
    throw new Error(data.error || 'REGISTER_FAILED');
  }
  if (data.token) {
    inMemoryToken = data.token;
  }
  return {
    authenticated: true,
    user: data.user,
    token: data.token ?? null,
  };
}

export async function loginAccount(
  contact: string,
  password: string,
): Promise<AuthSessionResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: getAuthHeaders({'Content-Type': 'application/json'}),
    body: JSON.stringify({contact, password}),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<AuthSessionResponse> & {
    error?: string;
  };
  if (!res.ok || !data.authenticated || !data.user) {
    throw new Error(data.error || 'INVALID_CREDENTIALS');
  }
  if (data.token) {
    inMemoryToken = data.token;
  }
  return {
    authenticated: true,
    user: data.user,
    token: data.token ?? null,
  };
}

export async function logoutAccount(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: getAuthHeaders(),
    });
  } finally {
    inMemoryToken = null;
  }
}
