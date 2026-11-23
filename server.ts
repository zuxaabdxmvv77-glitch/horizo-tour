import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {GoogleGenAI, ThinkingLevel, Type} from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import {
  CabinClass,
  DESTINATION_AIRPORTS,
  FLIGHT_SCHEDULES,
  ORIGIN_HUBS,
  calculateFlightTotalUsd,
} from './src/data/flights.ts';

dotenv.config();

type InquiryStatus = 'new' | 'contacted' | 'booked';
type InquirySource = 'home' | 'modal' | 'contact';
type TicketStatus =
  | 'pending_payment'
  | 'paid'
  | 'issued'
  | 'confirmed'
  | 'cancelled'
  | 'expired';
type UserRole = 'user' | 'owner';
type ContactType = 'phone' | 'email';
type InquiryLang =
  | 'uz'
  | 'ru'
  | 'en'
  | 'tr'
  | 'ar'
  | 'th'
  | 'vi'
  | 'id'
  | 'ms'
  | 'zh'
  | 'ko'
  | 'dv';

const ALLOWED_LANGS = new Set<string>([
  'uz',
  'ru',
  'en',
  'tr',
  'ar',
  'th',
  'vi',
  'id',
  'ms',
  'zh',
  'ko',
  'dv',
]);

interface InquiryRecord {
  id: string;
  name: string;
  phone: string;
  destinationSlug: string;
  destinationLabel: string;
  message: string;
  source: InquirySource;
  lang: InquiryLang;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

interface UserRecord {
  id: string;
  contactKey: string;
  contactDisplay: string;
  contactType: ContactType;
  passwordSalt: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface PublicUser {
  id: string;
  contactDisplay: string;
  contactType: ContactType;
  role: UserRole;
  createdAt: string;
}

interface VisitRecord {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visitsCount: number;
  lang: InquiryLang;
}

interface AiTicketBrief {
  boardingSummary: string;
  checkInNote: string;
  baggageAdvice: string;
  arrivalTip: string;
  preparedByModel: string;
  preparedAt: string;
}

interface TicketRecord {
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
  phone: string;
  passportLast4: string;
  unitPriceUsd: number;
  totalPriceUsd: number;
  lang: InquiryLang;
  status: TicketStatus;
  paymentToken: string;
  paymentExpiresAt: string;
  paidAt?: string;
  aiBrief?: AiTicketBrief;
  issuedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

const PAYMENT_WINDOW_MS = 1000 * 60 * 5; // 5 minutes exact QR payment hold

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.horizo-data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const SESSION_KEY_FILE = path.join(DATA_DIR, 'session.key');
const SESSION_COOKIE_NAME = 'horizo_auth_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days until explicit logout
const VISIT_BUMP_COOLDOWN_MS = 1000 * 60 * 5; // 5 minutes between counted repeat starts

const DEFAULT_OWNER_PHONES = ['998959770464'];
const DEFAULT_OWNER_EMAILS = ['zuxaabdxmvv@gmail.com', 'zuxaabdxmvv77@gmail.com'];

function normalizePhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 9) {
    return `998${digits}`;
  }
  return digits;
}

function getOwnerPhones(): Set<string> {
  const configured = (process.env.OWNER_PHONES ?? '')
    .split(',')
    .map((s) => normalizePhoneDigits(s.trim()))
    .filter((s) => s.length >= 9);
  return new Set([...DEFAULT_OWNER_PHONES, ...configured]);
}

function getOwnerEmails(): Set<string> {
  const configured = (process.env.OWNER_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes('@'));
  return new Set([...DEFAULT_OWNER_EMAILS, ...configured]);
}

interface ParsedContact {
  contactKey: string;
  contactDisplay: string;
  contactType: ContactType;
  isOwner: boolean;
}

function parseAndClassifyContact(rawInput: unknown): ParsedContact | null {
  if (typeof rawInput !== 'string') return null;
  const trimmed = rawInput.trim();
  if (!trimmed || trimmed.length > 120) return null;

  if (trimmed.includes('@')) {
    const email = trimmed.toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) return null;
    const ownerEmails = getOwnerEmails();
    return {
      contactKey: `email:${email}`,
      contactDisplay: email,
      contactType: 'email',
      isOwner: ownerEmails.has(email),
    };
  }

  const normalizedDigits = normalizePhoneDigits(trimmed);
  if (normalizedDigits.length < 9 || normalizedDigits.length > 15) {
    return null;
  }
  const ownerPhones = getOwnerPhones();
  const display = trimmed.startsWith('+') ? trimmed : `+${normalizedDigits}`;
  return {
    contactKey: `phone:${normalizedDigits}`,
    contactDisplay: display,
    contactType: 'phone',
    isOwner: ownerPhones.has(normalizedDigits),
  };
}

function isContactStillOwner(user: UserRecord): boolean {
  if (user.contactType === 'email') {
    const email = user.contactKey.replace(/^email:/, '');
    return getOwnerEmails().has(email);
  }
  const digits = user.contactKey.replace(/^phone:/, '');
  return getOwnerPhones().has(digits);
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  ensureDataDir();
  if (fs.existsSync(SESSION_KEY_FILE)) {
    return fs.readFileSync(SESSION_KEY_FILE, 'utf8').trim();
  }
  const secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SESSION_KEY_FILE, secret, {encoding: 'utf8', mode: 0o600});
  return secret;
}

function readJsonArray<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(filePath: string, records: T[]): void {
  ensureDataDir();
  const tempPath = `${filePath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(records, null, 2), {encoding: 'utf8', mode: 0o600});
  fs.renameSync(tempPath, filePath);
}

const PNR_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateUniquePnrCode(existing: TicketRecord[]): string {
  const taken = new Set(existing.map((t) => t.pnrCode));
  for (let attempt = 0; attempt < 24; attempt++) {
    const bytes = crypto.randomBytes(6);
    let code = 'HT-';
    for (let i = 0; i < 6; i++) {
      code += PNR_ALPHABET[bytes[i] % PNR_ALPHABET.length];
    }
    if (!taken.has(code)) {
      return code;
    }
  }
  return `HT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function timingSafeStringEqual(aStr: string, bStr: string): boolean {
  const a = Buffer.from(aStr, 'utf8');
  const b = Buffer.from(bStr, 'utf8');
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

function sanitizeTicket(
  ticket: TicketRecord,
  options: {includePaymentToken?: boolean; includePhone?: boolean} = {},
): Record<string, unknown> {
  const {paymentToken, phone, issuedByUserId: _uid, ...rest} = ticket;
  return {
    ...rest,
    ...(options.includePhone ? {phone} : {}),
    ...(options.includePaymentToken ? {paymentToken} : {}),
  };
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 10) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const LANG_DISPLAY_NAMES: Record<InquiryLang, string> = {
  uz: 'Uzbek (Latin script)',
  ru: 'Russian',
  en: 'English',
  tr: 'Turkish',
  ar: 'Arabic',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  zh: 'Simplified Chinese',
  ko: 'Korean',
  dv: 'Dhivehi',
};

async function generateAiTicketBrief(ticket: TicketRecord): Promise<AiTicketBrief> {
  const ai = createGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const languageName = LANG_DISPLAY_NAMES[ticket.lang] || 'Uzbek (Latin script)';
  const flight = FLIGHT_SCHEDULES.find((f) => f.id === ticket.flightId);
  const baggageKg = flight?.baggageKg ?? 23;

  const prompt = [
    `Prepare official e-ticket boarding instructions for Horizo Tour passenger.`,
    `Output language: ${languageName}.`,
    `PNR: ${ticket.pnrCode}`,
    `Passenger: ${ticket.passengerName} (${ticket.passengers} passenger(s))`,
    `Airline & Flight: ${ticket.airline} ${ticket.flightNumber}`,
    `Route: ${ticket.originCity} (${ticket.originCode}) -> ${ticket.destinationCity} (${ticket.destinationCode})`,
    `Date & Time: ${ticket.departureDate}, depart ${ticket.departureTime}, arrive ${ticket.arrivalTime}`,
    `Cabin: ${ticket.cabin}, Checked Baggage: ${baggageKg} kg.`,
    `Keep each field concise (1-2 clear sentences), accurate, and practical.`,
  ].join('\n');

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are Horizo Tour automated airline ticketing officer. Return crisp JSON boarding and preparation guidance in the requested language without markdown or placeholders.',
          responseMimeType: 'application/json',
          thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              boardingSummary: {
                type: Type.STRING,
                description: 'Official 1-sentence boarding confirmation summary.',
              },
              checkInNote: {
                type: Type.STRING,
                description: 'Recommended airport check-in opening time and counter/online tip.',
              },
              baggageAdvice: {
                type: Type.STRING,
                description: 'Baggage allowance and cabin carry-on reminder.',
              },
              arrivalTip: {
                type: Type.STRING,
                description: 'Practical destination arrival, customs, or transfer tip.',
              },
            },
            required: ['boardingSummary', 'checkInNote', 'baggageAdvice', 'arrivalTip'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as Partial<AiTicketBrief>;
      if (
        typeof parsed.boardingSummary === 'string' &&
        typeof parsed.checkInNote === 'string' &&
        typeof parsed.baggageAdvice === 'string' &&
        typeof parsed.arrivalTip === 'string'
      ) {
        return {
          boardingSummary: parsed.boardingSummary.trim(),
          checkInNote: parsed.checkInNote.trim(),
          baggageAdvice: parsed.baggageAdvice.trim(),
          arrivalTip: parsed.arrivalTip.trim(),
          preparedByModel: 'gemini-4-hydrogen',
          preparedAt: new Date().toISOString(),
        };
      }
      throw new Error('INVALID_AI_SCHEMA');
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('AI_GENERATION_FAILED');
}

function hashPassword(password: string, saltHex: string): string {
  return crypto.scryptSync(password, saltHex, 64).toString('hex');
}

function verifyPassword(password: string, saltHex: string, expectedHashHex: string): boolean {
  const computed = hashPassword(password, saltHex);
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(expectedHashHex, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    contactDisplay: user.contactDisplay,
    contactType: user.contactType,
    role: isContactStillOwner(user) ? 'owner' : 'user',
    createdAt: user.createdAt,
  };
}

function createSessionToken(userId: string, secret: string): string {
  const payload = JSON.stringify({
    sub: userId,
    exp: Date.now() + SESSION_TTL_MS,
  });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string | undefined, secret: string): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      sub?: unknown;
      exp?: unknown;
    };
    if (typeof parsed.sub === 'string' && typeof parsed.exp === 'number' && parsed.exp > Date.now()) {
      return parsed.sub;
    }
    return null;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

function isRequestHttps(req: express.Request): boolean {
  if (req.secure) return true;
  const forwarded = req.headers['x-forwarded-proto'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim() === 'https';
  }
  return false;
}

function setSessionCookie(req: express.Request, res: express.Response, token: string): void {
  const https = isRequestHttps(req);
  const flags = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (https) {
    // Required for cookies inside cross-origin HTTPS iframes (e.g. AI Studio preview)
    flags.push('SameSite=None', 'Secure', 'Partitioned');
  } else {
    flags.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', flags.join('; '));
}

function clearSessionCookie(req: express.Request, res: express.Response): void {
  const https = isRequestHttps(req);
  const flags = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
  ];
  if (https) {
    flags.push('SameSite=None', 'Secure', 'Partitioned');
  } else {
    flags.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', flags.join('; '));
}

function extractBearerToken(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    return token.length > 0 ? token : undefined;
  }
  return undefined;
}

function hasValidCookieMutationGuard(req: express.Request): boolean {
  if (extractBearerToken(req)) return true;
  if (req.headers['x-requested-with'] === 'HorizoTourClient') return true;
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  if (typeof origin === 'string' && typeof host === 'string') {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host.split(',')[0].trim()) return true;
    } catch {
      return false;
    }
  }
  return false;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const sessionSecret = getSessionSecret();

  app.use(express.json({limit: '32kb'}));

  const getAuthenticatedUser = (req: express.Request): {user: UserRecord; token: string} | null => {
    const bearer = extractBearerToken(req);
    const cookies = parseCookies(req.headers.cookie);
    const rawToken = bearer ?? cookies[SESSION_COOKIE_NAME];
    const userId = verifySessionToken(rawToken, sessionSecret);
    if (!userId || !rawToken) return null;

    const users = readJsonArray<UserRecord>(USERS_FILE);
    const user = users.find((u) => u.id === userId);
    if (!user) return null;
    return {user, token: rawToken};
  };

  // Auth: Current session status
  app.get('/api/auth/me', (req, res) => {
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.json({authenticated: false, user: null, token: null});
      return;
    }
    res.json({
      authenticated: true,
      user: toPublicUser(auth.user),
      token: auth.token,
    });
  });

  // Auth: Register new user (Phone or Email + Password)
  app.post('/api/auth/register', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const parsedContact = parseAndClassifyContact(body.contact);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!parsedContact) {
      res.status(400).json({error: 'INVALID_CONTACT'});
      return;
    }
    if (password.length < 6 || password.length > 128) {
      res.status(400).json({error: 'INVALID_PASSWORD'});
      return;
    }

    const users = readJsonArray<UserRecord>(USERS_FILE);
    const existing = users.find((u) => u.contactKey === parsedContact.contactKey);
    if (existing) {
      res.status(409).json({error: 'ACCOUNT_EXISTS'});
      return;
    }

    const now = new Date().toISOString();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);

    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      contactKey: parsedContact.contactKey,
      contactDisplay: parsedContact.contactDisplay,
      contactType: parsedContact.contactType,
      passwordSalt: salt,
      passwordHash: hash,
      role: parsedContact.isOwner ? 'owner' : 'user',
      createdAt: now,
      updatedAt: now,
    };

    users.unshift(newUser);
    writeJsonArray(USERS_FILE, users);

    const token = createSessionToken(newUser.id, sessionSecret);
    setSessionCookie(req, res, token);

    res.status(201).json({
      authenticated: true,
      user: toPublicUser(newUser),
      token,
    });
  });

  // Auth: Sign in existing user
  app.post('/api/auth/login', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const parsedContact = parseAndClassifyContact(body.contact);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!parsedContact || password.length < 1) {
      res.status(400).json({error: 'INVALID_CREDENTIALS'});
      return;
    }

    const users = readJsonArray<UserRecord>(USERS_FILE);
    const index = users.findIndex((u) => u.contactKey === parsedContact.contactKey);
    if (index === -1) {
      res.status(401).json({error: 'INVALID_CREDENTIALS'});
      return;
    }

    const found = users[index];
    if (!verifyPassword(password, found.passwordSalt, found.passwordHash)) {
      res.status(401).json({error: 'INVALID_CREDENTIALS'});
      return;
    }

    // Keep owner status dynamically synced if owner identifiers matched
    const expectedRole: UserRole = parsedContact.isOwner ? 'owner' : 'user';
    if (found.role !== expectedRole) {
      users[index] = {
        ...found,
        role: expectedRole,
        updatedAt: new Date().toISOString(),
      };
      writeJsonArray(USERS_FILE, users);
    }

    const token = createSessionToken(found.id, sessionSecret);
    setSessionCookie(req, res, token);

    res.json({
      authenticated: true,
      user: toPublicUser(users[index]),
      token,
    });
  });

  // Auth: Explicit Logout only
  app.post('/api/auth/logout', (req, res) => {
    clearSessionCookie(req, res);
    res.json({authenticated: false, user: null, token: null});
  });

  // Analytics: Record site open ("Start") with anonymous visitorId
  app.post('/api/analytics/start', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const rawVisitorId = typeof body.visitorId === 'string' ? body.visitorId.trim() : '';
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(rawVisitorId)) {
      res.status(400).json({error: 'INVALID_VISITOR_ID'});
      return;
    }

    const rawLang = typeof body.lang === 'string' ? body.lang.trim() : '';
    const lang: InquiryLang = ALLOWED_LANGS.has(rawLang) ? (rawLang as InquiryLang) : 'uz';
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();

    const visits = readJsonArray<VisitRecord>(VISITS_FILE);
    const existingIdx = visits.findIndex((v) => v.visitorId === rawVisitorId);

    if (existingIdx !== -1) {
      const existing = visits[existingIdx];
      const lastSeenMs = Date.parse(existing.lastSeenAt);
      const shouldIncrement =
        Number.isNaN(lastSeenMs) || nowMs - lastSeenMs >= VISIT_BUMP_COOLDOWN_MS;
      const updated: VisitRecord = {
        ...existing,
        lastSeenAt: nowIso,
        visitsCount: shouldIncrement ? (existing.visitsCount || 1) + 1 : existing.visitsCount || 1,
        lang,
      };
      visits.splice(existingIdx, 1);
      visits.unshift(updated);
      writeJsonArray(VISITS_FILE, visits.slice(0, 5000));
      res.json({recorded: true, isNewVisitor: false});
      return;
    }

    const created: VisitRecord = {
      visitorId: rawVisitorId,
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
      visitsCount: 1,
      lang,
    };
    visits.unshift(created);
    writeJsonArray(VISITS_FILE, visits.slice(0, 5000));
    res.status(201).json({recorded: true, isNewVisitor: true});
  });

  // Owner CRM: Site starts & registered users overview (owner only)
  app.get('/api/admin/overview', (req, res) => {
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    if (toPublicUser(auth.user).role !== 'owner') {
      res.status(403).json({error: 'Forbidden'});
      return;
    }

    const users = readJsonArray<UserRecord>(USERS_FILE);
    const visits = readJsonArray<VisitRecord>(VISITS_FILE);
    const tickets = readJsonArray<TicketRecord>(TICKETS_FILE);

    const uniqueStarts = visits.length;
    const totalStarts = visits.reduce((sum, v) => sum + (v.visitsCount || 1), 0);
    const registeredUsersCount = users.length;
    const ticketsCount = tickets.length;

    const recentUsers = users.slice(0, 20).map(toPublicUser);
    const recentVisits = visits.slice(0, 20).map((v) => ({
      visitorId: v.visitorId.slice(0, 8),
      firstSeenAt: v.firstSeenAt,
      lastSeenAt: v.lastSeenAt,
      visitsCount: v.visitsCount || 1,
      lang: v.lang,
    }));

    res.json({
      stats: {
        uniqueStarts,
        totalStarts,
        registeredUsersCount,
        ticketsCount,
      },
      recentUsers,
      recentVisits,
    });
  });

  // Client: Submit tour inquiry
  app.post('/api/inquiries', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 32) : '';
    const destinationSlug =
      typeof body.destinationSlug === 'string' ? body.destinationSlug.trim().slice(0, 64) : '';
    const destinationLabel =
      typeof body.destinationLabel === 'string' ? body.destinationLabel.trim().slice(0, 100) : '-';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : '';
    const source: InquirySource =
      body.source === 'home' || body.source === 'modal' || body.source === 'contact'
        ? body.source
        : 'contact';
    const rawLang = typeof body.lang === 'string' ? body.lang.trim() : '';
    const lang: InquiryLang = ALLOWED_LANGS.has(rawLang) ? (rawLang as InquiryLang) : 'uz';

    const digits = phone.replace(/\D/g, '');
    if (name.length < 1 || digits.length < 9) {
      res.status(400).json({error: 'Invalid name or phone number.'});
      return;
    }

    const now = new Date().toISOString();
    const record: InquiryRecord = {
      id: crypto.randomUUID(),
      name,
      phone,
      destinationSlug,
      destinationLabel: destinationLabel || '-',
      message,
      source,
      lang,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };

    const list = readJsonArray<InquiryRecord>(INQUIRIES_FILE);
    list.unshift(record);
    writeJsonArray(INQUIRIES_FILE, list);

    res.status(201).json({inquiry: record});
  });

  // Owner CRM: List inquiries (owner only)
  app.get('/api/inquiries', (req, res) => {
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    if (toPublicUser(auth.user).role !== 'owner') {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const inquiries = readJsonArray<InquiryRecord>(INQUIRIES_FILE);
    res.json({inquiries});
  });

  // Owner CRM: Update inquiry status (owner only)
  app.patch('/api/inquiries/:id', (req, res) => {
    if (!hasValidCookieMutationGuard(req)) {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    if (toPublicUser(auth.user).role !== 'owner') {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const {id} = req.params;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const status = body.status;
    if (status !== 'new' && status !== 'contacted' && status !== 'booked') {
      res.status(400).json({error: 'Invalid status.'});
      return;
    }

    const list = readJsonArray<InquiryRecord>(INQUIRIES_FILE);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      res.status(404).json({error: 'Inquiry not found.'});
      return;
    }

    list[index] = {
      ...list[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    writeJsonArray(INQUIRIES_FILE, list);
    res.json({inquiry: list[index]});
  });

  // Owner CRM: Delete inquiry (owner only)
  app.delete('/api/inquiries/:id', (req, res) => {
    if (!hasValidCookieMutationGuard(req)) {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    if (toPublicUser(auth.user).role !== 'owner') {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const {id} = req.params;
    const list = readJsonArray<InquiryRecord>(INQUIRIES_FILE);
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length === list.length) {
      res.status(404).json({error: 'Inquiry not found.'});
      return;
    }
    writeJsonArray(INQUIRIES_FILE, filtered);
    res.json({deleted: true});
  });

  // Client: Step 1 — Reserve flight for 5-minute QR payment hold
  app.post('/api/tickets/reserve', (req, res) => {
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const flightId = typeof body.flightId === 'string' ? body.flightId.trim() : '';
    const flight = FLIGHT_SCHEDULES.find((f) => f.id === flightId);
    if (!flight) {
      res.status(400).json({error: 'INVALID_FLIGHT'});
      return;
    }

    const departureDate = typeof body.departureDate === 'string' ? body.departureDate.trim() : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
      res.status(400).json({error: 'INVALID_DATE'});
      return;
    }
    const parsedDateMs = Date.parse(`${departureDate}T00:00:00Z`);
    const minValidMs = Date.now() - 1000 * 60 * 60 * 36;
    const maxValidMs = Date.now() + 1000 * 60 * 60 * 24 * 400;
    if (Number.isNaN(parsedDateMs) || parsedDateMs < minValidMs || parsedDateMs > maxValidMs) {
      res.status(400).json({error: 'INVALID_DATE'});
      return;
    }

    const cabin: CabinClass = body.cabin === 'business' ? 'business' : 'economy';
    if (body.cabin !== 'economy' && body.cabin !== 'business') {
      res.status(400).json({error: 'INVALID_CABIN'});
      return;
    }

    const rawPassengers =
      typeof body.passengers === 'number' ? body.passengers : Number(body.passengers);
    if (!Number.isInteger(rawPassengers) || rawPassengers < 1 || rawPassengers > 6) {
      res.status(400).json({error: 'INVALID_PASSENGERS'});
      return;
    }

    const passengerName =
      typeof body.passengerName === 'string' ? body.passengerName.trim().slice(0, 80) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 32) : '';
    const digits = phone.replace(/\D/g, '');
    if (passengerName.length < 2 || digits.length < 9 || digits.length > 15) {
      res.status(400).json({error: 'INVALID_PASSENGER_DETAILS'});
      return;
    }

    const rawPassport =
      typeof body.passportNumber === 'string'
        ? body.passportNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
        : '';
    const passportLast4 = rawPassport.length >= 4 ? rawPassport.slice(-4) : '';

    const rawLang = typeof body.lang === 'string' ? body.lang.trim() : '';
    const lang: InquiryLang = ALLOWED_LANGS.has(rawLang) ? (rawLang as InquiryLang) : 'uz';

    const {unitPriceUsd, totalPriceUsd} = calculateFlightTotalUsd(flight, cabin, rawPassengers);
    const originHub = ORIGIN_HUBS.find((o) => o.code === flight.originCode);
    const destAirport = DESTINATION_AIRPORTS.find((d) => d.slug === flight.destinationSlug);

    const existingTickets = readJsonArray<TicketRecord>(TICKETS_FILE);
    const pnrCode = generateUniquePnrCode(existingTickets);
    const paymentToken = crypto.randomBytes(16).toString('hex');
    const nowMs = Date.now();
    const now = new Date(nowMs).toISOString();
    const paymentExpiresAt = new Date(nowMs + PAYMENT_WINDOW_MS).toISOString();

    const record: TicketRecord = {
      id: crypto.randomUUID(),
      pnrCode,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      originCode: flight.originCode,
      originCity: originHub ? originHub.names[lang] : flight.originCode,
      destinationSlug: flight.destinationSlug,
      destinationCode: flight.destinationCode,
      destinationCity: destAirport ? destAirport.cityNames[lang] : flight.destinationCode,
      departureDate,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      cabin,
      passengers: rawPassengers,
      passengerName,
      phone,
      passportLast4,
      unitPriceUsd,
      totalPriceUsd,
      lang,
      status: 'pending_payment',
      paymentToken,
      paymentExpiresAt,
      issuedByUserId: auth.user.id,
      createdAt: now,
      updatedAt: now,
    };

    existingTickets.unshift(record);
    writeJsonArray(TICKETS_FILE, existingTickets);

    res.status(201).json({
      ticket: sanitizeTicket(record, {includePaymentToken: true, includePhone: true}),
    });
  });

  // Public/Creator: Poll 5-minute QR payment status
  app.get('/api/tickets/payment/:pnr/status', (req, res) => {
    const pnr = String(req.params.pnr || '').trim().toUpperCase();
    const token = typeof req.query.token === 'string' ? req.query.token.trim() : '';

    const tickets = readJsonArray<TicketRecord>(TICKETS_FILE);
    const index = tickets.findIndex((t) => t.pnrCode === pnr);
    if (index === -1) {
      res.status(404).json({error: 'TICKET_NOT_FOUND'});
      return;
    }

    const ticket = tickets[index];
    if (!timingSafeStringEqual(token, ticket.paymentToken)) {
      res.status(403).json({error: 'INVALID_PAYMENT_TOKEN'});
      return;
    }

    const expiresMs = Date.parse(ticket.paymentExpiresAt);
    const nowMs = Date.now();
    if (ticket.status === 'pending_payment' && !Number.isNaN(expiresMs) && nowMs > expiresMs) {
      tickets[index] = {
        ...ticket,
        status: 'expired',
        updatedAt: new Date(nowMs).toISOString(),
      };
      writeJsonArray(TICKETS_FILE, tickets);
    }

    const current = tickets[index];
    const remainingSeconds =
      current.status === 'pending_payment' && !Number.isNaN(expiresMs)
        ? Math.max(0, Math.floor((expiresMs - nowMs) / 1000))
        : 0;

    res.json({
      pnrCode: current.pnrCode,
      status: current.status,
      paymentExpiresAt: current.paymentExpiresAt,
      remainingSeconds,
      totalPriceUsd: current.totalPriceUsd,
      airline: current.airline,
      flightNumber: current.flightNumber,
      originCode: current.originCode,
      originCity: current.originCity,
      destinationCode: current.destinationCode,
      destinationCity: current.destinationCity,
      departureDate: current.departureDate,
      departureTime: current.departureTime,
      arrivalTime: current.arrivalTime,
      cabin: current.cabin,
      passengers: current.passengers,
      passengerName: current.passengerName,
      paidAt: current.paidAt,
      aiBrief: current.aiBrief,
    });
  });

  // Public (token-authorized) QR Payment Confirm + Server-Side Gemini AI Ticket Issuance
  app.post('/api/tickets/payment/:pnr/confirm', async (req, res) => {
    const pnr = String(req.params.pnr || '').trim().toUpperCase();
    const body = (req.body ?? {}) as Record<string, unknown>;
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    const tickets = readJsonArray<TicketRecord>(TICKETS_FILE);
    const index = tickets.findIndex((t) => t.pnrCode === pnr);
    if (index === -1) {
      res.status(404).json({error: 'TICKET_NOT_FOUND'});
      return;
    }

    let ticket = tickets[index];
    if (!timingSafeStringEqual(token, ticket.paymentToken)) {
      res.status(403).json({error: 'INVALID_PAYMENT_TOKEN'});
      return;
    }

    if (ticket.status === 'issued' || ticket.status === 'confirmed') {
      res.json({ticket: sanitizeTicket(ticket)});
      return;
    }

    if (ticket.status === 'cancelled' || ticket.status === 'expired') {
      res.status(410).json({error: 'PAYMENT_EXPIRED', status: ticket.status});
      return;
    }

    const expiresMs = Date.parse(ticket.paymentExpiresAt);
    const nowIso = new Date().toISOString();
    if (ticket.status === 'pending_payment' && !Number.isNaN(expiresMs) && Date.now() > expiresMs) {
      tickets[index] = {...ticket, status: 'expired', updatedAt: nowIso};
      writeJsonArray(TICKETS_FILE, tickets);
      res.status(410).json({error: 'PAYMENT_EXPIRED', status: 'expired'});
      return;
    }

    // Mark as paid immediately so payment state persists even if AI step needs retry
    if (ticket.status === 'pending_payment') {
      ticket = {
        ...ticket,
        status: 'paid',
        paidAt: nowIso,
        updatedAt: nowIso,
      };
      tickets[index] = ticket;
      writeJsonArray(TICKETS_FILE, tickets);
    }

    try {
      const aiBrief = await generateAiTicketBrief(ticket);
      const updated: TicketRecord = {
        ...ticket,
        status: 'issued',
        aiBrief,
        updatedAt: new Date().toISOString(),
      };
      const latestTickets = readJsonArray<TicketRecord>(TICKETS_FILE);
      const latestIdx = latestTickets.findIndex((t) => t.id === ticket.id);
      if (latestIdx !== -1) {
        latestTickets[latestIdx] = updated;
        writeJsonArray(TICKETS_FILE, latestTickets);
      }
      res.json({ticket: sanitizeTicket(updated)});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI_GENERATION_FAILED';
      const statusCode = message === 'GEMINI_API_KEY_MISSING' ? 503 : 502;
      res.status(statusCode).json({
        error: message,
        status: 'paid',
      });
    }
  });

  // Public: Official E-Ticket Verification endpoint (opened when final ticket QR code is scanned)
  app.get('/api/tickets/verify/:pnr', (req, res) => {
    const pnr = String(req.params.pnr || '').trim().toUpperCase();
    if (!/^HT-[A-Z0-9]{4,10}$/.test(pnr)) {
      res.status(400).json({error: 'INVALID_PNR'});
      return;
    }

    const tickets = readJsonArray<TicketRecord>(TICKETS_FILE);
    const index = tickets.findIndex((t) => t.pnrCode === pnr);
    if (index === -1) {
      res.status(404).json({error: 'TICKET_NOT_FOUND'});
      return;
    }

    const current = tickets[index];
    const expiresMs = Date.parse(current.paymentExpiresAt);
    if (current.status === 'pending_payment' && !Number.isNaN(expiresMs) && Date.now() > expiresMs) {
      tickets[index] = {...current, status: 'expired', updatedAt: new Date().toISOString()};
      writeJsonArray(TICKETS_FILE, tickets);
    }

    res.json({ticket: sanitizeTicket(tickets[index])});
  });

  // Owner CRM: List online flight tickets (owner only)
  app.get('/api/tickets', (req, res) => {
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    if (toPublicUser(auth.user).role !== 'owner') {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const tickets = readJsonArray<TicketRecord>(TICKETS_FILE).map((t) =>
      sanitizeTicket(t, {includePhone: true}),
    );
    res.json({tickets});
  });

  // Owner CRM: Update ticket status (owner only)
  app.patch('/api/tickets/:id', (req, res) => {
    if (!hasValidCookieMutationGuard(req)) {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    if (toPublicUser(auth.user).role !== 'owner') {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const {id} = req.params;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const status = body.status;
    if (
      status !== 'pending_payment' &&
      status !== 'paid' &&
      status !== 'issued' &&
      status !== 'confirmed' &&
      status !== 'cancelled' &&
      status !== 'expired'
    ) {
      res.status(400).json({error: 'Invalid ticket status.'});
      return;
    }

    const list = readJsonArray<TicketRecord>(TICKETS_FILE);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      res.status(404).json({error: 'Ticket not found.'});
      return;
    }

    list[index] = {
      ...list[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    writeJsonArray(TICKETS_FILE, list);
    res.json({ticket: sanitizeTicket(list[index], {includePhone: true})});
  });

  // Owner CRM: Delete ticket (owner only)
  app.delete('/api/tickets/:id', (req, res) => {
    if (!hasValidCookieMutationGuard(req)) {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const auth = getAuthenticatedUser(req);
    if (!auth) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
    if (toPublicUser(auth.user).role !== 'owner') {
      res.status(403).json({error: 'Forbidden'});
      return;
    }
    const {id} = req.params;
    const list = readJsonArray<TicketRecord>(TICKETS_FILE);
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length === list.length) {
      res.status(404).json({error: 'Ticket not found.'});
      return;
    }
    writeJsonArray(TICKETS_FILE, filtered);
    res.json({deleted: true});
  });

  // Frontend serving: Vite middleware in dev, static dist/ in production
  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Horizo Tour server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
