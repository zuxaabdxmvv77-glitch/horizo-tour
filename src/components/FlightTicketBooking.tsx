import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Luggage,
  Minus,
  Plane,
  PlaneTakeoff,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {
  CabinClass,
  DESTINATION_AIRPORTS,
  FLIGHT_SCHEDULES,
  FlightSchedule,
  ORIGIN_HUBS,
  OriginHubCode,
  calculateFlightTotalUsd,
} from '../data/flights';
import {TICKET_TRANSLATIONS} from '../i18n/ticketTranslations';
import {
  confirmTicketPayment,
  fetchPaymentStatus,
  reserveFlightTicket,
  TicketRecord,
  verifyTicketByPnr,
} from '../services/ticketsApi';
import {
  buildTelegramAppUrl,
  buildTelegramDraftUrl,
  copyTextSafely,
  saveLatestTelegramDraft,
} from '../utils/telegramDraft';

function getTomorrowIsoDate(): string {
  const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
  return tomorrow.toISOString().slice(0, 10);
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function buildTicketTelegramText(ticket: TicketRecord, cabinLabel: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const lines = [
    `Horizo Tour · Rasmiy E-Ticket (${ticket.pnrCode})`,
    `Marshrut: ${ticket.originCode} -> ${ticket.destinationCode} (${ticket.destinationCity})`,
    `Reys: ${ticket.airline} · ${ticket.flightNumber}`,
    `Sana: ${ticket.departureDate} (${ticket.departureTime} - ${ticket.arrivalTime})`,
    `Klass: ${cabinLabel} | Yo'lovchilar: ${ticket.passengers}`,
    `Yo'lovchi: ${ticket.passengerName}`,
    ticket.phone ? `Telefon: ${ticket.phone}` : null,
    ticket.passportLast4 ? `Hujjat: •••• ${ticket.passportLast4}` : null,
    `To'langan summa: $${ticket.totalPriceUsd}`,
    origin ? `Rasmiy tekshirish sahifasi: ${origin}/ticket/${ticket.pnrCode}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

interface FlightTicketBookingProps {
  initialDestinationSlug?: string;
}

export function FlightTicketBooking({initialDestinationSlug}: FlightTicketBookingProps) {
  const {lang} = useLanguage();
  const {user} = useAuth();
  const tt = TICKET_TRANSLATIONS[lang] ?? TICKET_TRANSLATIONS.uz;

  const validInitialDest = DESTINATION_AIRPORTS.some((d) => d.slug === initialDestinationSlug)
    ? (initialDestinationSlug as string)
    : 'dubai';

  const [originCode, setOriginCode] = useState<OriginHubCode>('TAS');
  const [destinationSlug, setDestinationSlug] = useState<string>(validInitialDest);
  const [departureDate, setDepartureDate] = useState<string>(getTomorrowIsoDate);
  const [passengers, setPassengers] = useState<number>(1);
  const [cabin, setCabin] = useState<CabinClass>('economy');

  const matchingFlights = useMemo(() => {
    return FLIGHT_SCHEDULES.filter(
      (f) => f.originCode === originCode && f.destinationSlug === destinationSlug,
    );
  }, [originCode, destinationSlug]);

  const [selectedFlightId, setSelectedFlightId] = useState<string>(
    () => matchingFlights[0]?.id ?? '',
  );

  useEffect(() => {
    if (!matchingFlights.some((f) => f.id === selectedFlightId)) {
      setSelectedFlightId(matchingFlights[0]?.id ?? '');
    }
  }, [matchingFlights, selectedFlightId]);

  const selectedFlight: FlightSchedule | undefined = useMemo(
    () => matchingFlights.find((f) => f.id === selectedFlightId) ?? matchingFlights[0],
    [matchingFlights, selectedFlightId],
  );

  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState(() =>
    user?.contactType === 'phone' ? user.contactDisplay : '',
  );
  const [passportNumber, setPassportNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Stage 2: 5-minute QR payment hold
  const [reservedTicket, setReservedTicket] = useState<TicketRecord | null>(null);
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [paymentExpired, setPaymentExpired] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [aiPendingRetry, setAiPendingRetry] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Stage 3: AI-prepared official digital e-ticket
  const [issuedTicket, setIssuedTicket] = useState<TicketRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const paymentCardRef = useRef<HTMLDivElement | null>(null);
  const ticketRef = useRef<HTMLDivElement | null>(null);

  // Payment QR Code -> opens mobile confirmation URL
  useEffect(() => {
    if (!reservedTicket || !reservedTicket.paymentToken || typeof window === 'undefined') {
      setPaymentQrDataUrl('');
      return;
    }
    const payUrl = `${window.location.origin}/ticket/pay/${reservedTicket.pnrCode}?token=${encodeURIComponent(
      reservedTicket.paymentToken,
    )}`;

    let cancelled = false;
    QRCode.toDataURL(payUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0B1F5C',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setPaymentQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPaymentQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [reservedTicket]);

  // 1-second countdown timer for the 5-minute payment hold
  useEffect(() => {
    if (!reservedTicket || issuedTicket) return;
    const expiresMs = Date.parse(reservedTicket.paymentExpiresAt);
    if (Number.isNaN(expiresMs)) return;

    const tick = () => {
      const next = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0 && reservedTicket.status === 'pending_payment') {
        setPaymentExpired(true);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [reservedTicket, issuedTicket]);

  // Live 2.5s polling so confirming via mobile QR automatically unlocks desktop E-Ticket
  useEffect(() => {
    if (!reservedTicket || !reservedTicket.paymentToken || issuedTicket || paymentExpired) {
      return;
    }
    let active = true;
    const poll = async () => {
      try {
        const statusRes = await fetchPaymentStatus(
          reservedTicket.pnrCode,
          reservedTicket.paymentToken as string,
        );
        if (!active) return;

        if (statusRes.status === 'issued' || statusRes.status === 'confirmed') {
          const verified = await verifyTicketByPnr(reservedTicket.pnrCode);
          if (!active) return;
          setIssuedTicket(verified);
          setReservedTicket(null);
          const cabinText = verified.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy;
          saveLatestTelegramDraft(buildTicketTelegramText(verified, cabinText));
          setTimeout(() => {
            ticketRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
          }, 80);
        } else if (statusRes.status === 'paid') {
          setAiPendingRetry(true);
        } else if (statusRes.status === 'expired' || statusRes.status === 'cancelled') {
          setPaymentExpired(true);
          setRemainingSeconds(0);
        }
      } catch {
        // Silent retry on transient polling failure
      }
    };

    const interval = window.setInterval(() => {
      void poll();
    }, 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [reservedTicket, issuedTicket, paymentExpired, tt.cabinBusiness, tt.cabinEconomy]);

  // Final Issued Ticket QR Code -> official public verification URL (/ticket/:pnr)
  useEffect(() => {
    if (!issuedTicket || typeof window === 'undefined') {
      setQrDataUrl('');
      return;
    }
    const verifyUrl = `${window.location.origin}/ticket/${issuedTicket.pnrCode}`;

    let cancelled = false;
    QRCode.toDataURL(verifyUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0B1F5C',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [issuedTicket]);

  const selectedDestination = useMemo(
    () => DESTINATION_AIRPORTS.find((d) => d.slug === destinationSlug),
    [destinationSlug],
  );

  const selectedPricing = useMemo(() => {
    if (!selectedFlight) return null;
    return calculateFlightTotalUsd(selectedFlight, cabin, passengers);
  }, [selectedFlight, cabin, passengers]);

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;

    const cleanName = passengerName.trim();
    const digits = phone.replace(/\D/g, '');
    if (cleanName.length < 2 || digits.length < 9) {
      setErrorMsg(tt.validationError);
      return;
    }

    setErrorMsg('');
    setPaymentError('');
    setPaymentExpired(false);
    setAiPendingRetry(false);
    setIssuedTicket(null);
    setSubmitting(true);

    try {
      const hold = await reserveFlightTicket({
        flightId: selectedFlight.id,
        departureDate,
        cabin,
        passengers,
        passengerName: cleanName,
        phone: phone.trim(),
        passportNumber: passportNumber.trim() || undefined,
        lang,
      });

      setReservedTicket(hold);
      setRemainingSeconds(300);

      setTimeout(() => {
        paymentCardRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 80);
    } catch {
      setErrorMsg(tt.issueError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!reservedTicket || !reservedTicket.paymentToken || confirmingPayment) return;
    setConfirmingPayment(true);
    setPaymentError('');
    try {
      const {ticket} = await confirmTicketPayment(
        reservedTicket.pnrCode,
        reservedTicket.paymentToken,
      );
      setIssuedTicket(ticket);
      setReservedTicket(null);
      setAiPendingRetry(false);

      const cabinText = ticket.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy;
      saveLatestTelegramDraft(buildTicketTelegramText(ticket, cabinText));

      setTimeout(() => {
        ticketRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 80);
    } catch (err) {
      const typedErr = err as Error & {ticketStatus?: string};
      if (typedErr.ticketStatus === 'paid') {
        setAiPendingRetry(true);
        setReservedTicket((prev) => (prev ? {...prev, status: 'paid'} : prev));
      } else if (typedErr.message === 'PAYMENT_EXPIRED') {
        setPaymentExpired(true);
        setRemainingSeconds(0);
      }
      setPaymentError(`${tt.issueError} (${typedErr.message || 'ERROR'})`);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const ticketTelegramText = useMemo(() => {
    if (!issuedTicket) return '';
    const cabinText = issuedTicket.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy;
    return buildTicketTelegramText(issuedTicket, cabinText);
  }, [issuedTicket, tt.cabinBusiness, tt.cabinEconomy]);

  const handleCopyTicket = () => {
    if (!ticketTelegramText) return;
    copyTextSafely(ticketTelegramText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const progressPct = Math.max(0, Math.min(100, (remainingSeconds / 300) * 100));

  return (
    <div className="space-y-8">
      {/* Search & Controls Panel (hidden when printing the e-ticket) */}
      <div className="print:hidden rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-7 border border-black/6 dark:border-white/10 shadow-[0_14px_38px_rgba(11,31,92,0.06)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#FF8A00]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tt.badge}</span>
            </span>
            <h2 className="text-[clamp(1.6rem,3vw,2.35rem)] font-light leading-tight text-[#111111] dark:text-white">
              {tt.title}
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5A5A56] dark:text-[#A1A7B8]">
              {tt.subtitle}
            </p>
          </div>

          {/* Cabin Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full bg-[#F6F5F2] dark:bg-[#0B0E17] p-1 border border-black/6 dark:border-white/10 self-start">
            {(['economy', 'business'] as const).map((mode) => {
              const active = cabin === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCabin(mode)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                      : 'text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  {mode === 'economy' ? tt.cabinEconomy : tt.cabinBusiness}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-column Flight Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin */}
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] flex items-center gap-1.5">
              <PlaneTakeoff className="w-3.5 h-3.5 text-[#FF8A00]" />
              {tt.originLabel}
            </span>
            <select
              value={originCode}
              onChange={(e) => setOriginCode(e.target.value as OriginHubCode)}
              className="w-full rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 px-4 py-3 min-h-[46px] text-[14px] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
            >
              {ORIGIN_HUBS.map((hub) => (
                <option key={hub.code} value={hub.code}>
                  {hub.names[lang]}
                </option>
              ))}
            </select>
          </label>

          {/* Destination */}
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-[#FF8A00]" />
              {tt.destinationLabel}
            </span>
            <select
              value={destinationSlug}
              onChange={(e) => setDestinationSlug(e.target.value)}
              className="w-full rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 px-4 py-3 min-h-[46px] text-[14px] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
            >
              {DESTINATION_AIRPORTS.map((dest) => (
                <option key={dest.slug} value={dest.slug}>
                  {dest.cityNames[lang]} ({dest.code})
                </option>
              ))}
            </select>
          </label>

          {/* Date */}
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF8A00]" />
              {tt.dateLabel}
            </span>
            <input
              type="date"
              min={getTodayIsoDate()}
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value || getTomorrowIsoDate())}
              className="w-full rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 px-4 py-3 min-h-[46px] text-[14px] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
            />
          </label>

          {/* Passengers */}
          <div className="space-y-1.5">
            <span className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FF8A00]" />
              {tt.passengersLabel}
            </span>
            <div className="flex items-center justify-between rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 px-3 py-1.5 min-h-[46px]">
              <button
                type="button"
                onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                disabled={passengers <= 1}
                aria-label="Decrease passengers"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#141926] border border-black/8 dark:border-white/15 flex items-center justify-center text-[#111111] dark:text-white disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[15px] font-semibold tabular-nums text-[#111111] dark:text-white">
                {passengers}
              </span>
              <button
                type="button"
                onClick={() => setPassengers((p) => Math.min(6, p + 1))}
                disabled={passengers >= 6}
                aria-label="Increase passengers"
                className="w-8 h-8 rounded-full bg-white dark:bg-[#141926] border border-black/8 dark:border-white/15 flex items-center justify-center text-[#111111] dark:text-white disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stage 2: 5-Minute QR Payment Confirmation Card */}
      {reservedTicket && !issuedTicket && (
        <div
          ref={paymentCardRef}
          className="print:hidden rounded-[28px] overflow-hidden border border-[#FF8A00]/35 bg-white/98 dark:bg-[#141926]/98 shadow-[0_24px_60px_rgba(11,31,92,0.16)]"
        >
          <div className="bg-gradient-to-r from-[#0B1F5C] via-[#132F7A] to-[#0B1F5C] px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#FF8A00] font-semibold">
                {tt.paymentStageBadge} · {reservedTicket.pnrCode}
              </p>
              <h3 className="text-[19px] sm:text-[22px] font-medium leading-tight mt-0.5">
                {paymentExpired ? tt.paymentExpiredTitle : tt.paymentTitle}
              </h3>
            </div>

            <div className="rounded-2xl bg-white/12 border border-white/20 px-4 py-2 text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/75">
                {tt.paymentCountdownLabel}
              </p>
              <p
                className={`text-[22px] font-bold font-mono tabular-nums ${
                  remainingSeconds <= 60 ? 'text-red-300' : 'text-[#FF8A00]'
                }`}
              >
                {formatCountdown(remainingSeconds)}
              </p>
            </div>
          </div>

          <div className="h-1.5 w-full bg-black/8 dark:bg-white/10">
            <div
              className="h-full bg-[#FF8A00] transition-all duration-500"
              style={{width: `${progressPct}%`}}
            />
          </div>

          {paymentExpired ? (
            <div className="p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/12 text-red-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-[15px] text-[#5A5A56] dark:text-[#A1A7B8] max-w-md mx-auto">
                {tt.paymentExpiredText}
              </p>
              <button
                type="button"
                onClick={() => {
                  setReservedTicket(null);
                  setPaymentExpired(false);
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-6 py-3 text-[14px] font-medium cursor-pointer"
              >
                {tt.paymentRetryBookingBtn}
              </button>
            </div>
          ) : (
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-7 items-center">
              <div className="space-y-5">
                <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                  {tt.paymentSubtitle}
                </p>

                <div className="rounded-[20px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-4 sm:p-5 border border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[15px] font-semibold text-[#111111] dark:text-white">
                      {reservedTicket.originCode} → {reservedTicket.destinationCode} (
                      {reservedTicket.destinationCity})
                    </p>
                    <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                      {reservedTicket.airline} · {reservedTicket.flightNumber} ·{' '}
                      {reservedTicket.departureDate} ({reservedTicket.departureTime}–
                      {reservedTicket.arrivalTime})
                    </p>
                    <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                      {reservedTicket.passengerName} · {reservedTicket.passengers} pax ·{' '}
                      {reservedTicket.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                      {tt.paymentAmountLabel}
                    </p>
                    <p className="text-[26px] font-bold text-[#FF8A00] tabular-nums">
                      ${reservedTicket.totalPriceUsd}
                    </p>
                  </div>
                </div>

                {paymentError && (
                  <p
                    role="alert"
                    className="rounded-2xl bg-red-500/10 border border-red-500/25 px-4 py-2.5 text-[13px] text-red-600 dark:text-red-400"
                  >
                    {paymentError}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={confirmingPayment}
                    onClick={() => void handleConfirmPayment()}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] hover:bg-[#FF8A00] dark:hover:bg-[#e57c00] text-white font-semibold px-6 py-3.5 min-h-[48px] text-[14px] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {confirmingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{tt.paymentAiPreparing}</span>
                      </>
                    ) : aiPendingRetry ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{tt.paymentAiRetryBtn}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{tt.paymentConfirmBtn}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={confirmingPayment}
                    onClick={() => setReservedTicket(null)}
                    className="rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white px-5 py-3 min-h-[48px] text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    {tt.paymentCancelBtn}
                  </button>
                </div>

                <p className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-[#FF8A00] animate-spin" />
                  <span>{tt.paymentPollingActive}</span>
                </p>
              </div>

              {/* Scannable 5-minute Payment QR */}
              <div className="flex flex-col items-center text-center gap-2.5 md:border-s md:border-dashed md:border-black/15 dark:md:border-white/18 md:ps-7">
                <div className="rounded-[20px] bg-white p-3.5 border border-black/10 shadow-sm">
                  {paymentQrDataUrl ? (
                    <img
                      src={paymentQrDataUrl}
                      alt={`Payment QR ${reservedTicket.pnrCode}`}
                      className="w-[168px] h-[168px] block"
                    />
                  ) : (
                    <div className="w-[168px] h-[168px] flex items-center justify-center text-[#0B1F5C]">
                      <QrCode className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <p className="text-[11.5px] text-[#5A5A56] dark:text-[#A1A7B8] max-w-[180px]">
                  {tt.paymentScanHint}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 3: Issued Digital E-Ticket Boarding Pass + AI Brief */}
      {issuedTicket && (
        <div
          ref={ticketRef}
          className="rounded-[28px] overflow-hidden border border-[#0B1F5C]/15 dark:border-white/15 bg-white dark:bg-[#141926] shadow-[0_24px_60px_rgba(11,31,92,0.16)]"
        >
          {/* Boarding Pass Top Banner */}
          <div className="bg-gradient-to-r from-[#0B1F5C] via-[#132F7A] to-[#0B1F5C] px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF8A00] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/75 font-semibold">
                  HORIZO TOUR · OFFICIAL AI E-TICKET
                </p>
                <h3 className="text-[18px] sm:text-[21px] font-medium leading-tight">
                  {tt.ticketIssuedTitle}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/12 border border-white/20 px-4 py-2 text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/70">{tt.pnrLabel}</p>
                <p className="text-[18px] font-bold font-mono tracking-wider text-[#FF8A00] tabular-nums">
                  {issuedTicket.pnrCode}
                </p>
              </div>
            </div>
          </div>

          {/* Boarding Pass Main Grid + QR Code */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-7 items-start">
            <div className="space-y-6">
              <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8] print:hidden">
                {tt.ticketIssuedSubtitle}
              </p>

              {/* Big Route Display */}
              <div className="rounded-[20px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-5 border border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-[#0B1F5C] dark:text-white tabular-nums">
                    {issuedTicket.originCode}
                  </p>
                  <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                    {issuedTicket.originCity}
                  </p>
                  <p className="text-[15px] font-semibold text-[#111111] dark:text-white mt-1 tabular-nums">
                    {issuedTicket.departureTime}
                  </p>
                </div>

                <div className="flex-1 min-w-[120px] flex flex-col items-center gap-1.5 px-2">
                  <span className="text-[12px] font-medium text-[#FF8A00]">
                    {issuedTicket.airline} · {issuedTicket.flightNumber}
                  </span>
                  <div className="w-full flex items-center gap-2">
                    <span className="h-[2px] flex-1 bg-black/15 dark:bg-white/20 rounded-full" />
                    <Plane className="w-4 h-4 text-[#FF8A00] shrink-0" />
                    <span className="h-[2px] flex-1 bg-black/15 dark:bg-white/20 rounded-full" />
                  </div>
                  <span className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                    {issuedTicket.departureDate}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-[#0B1F5C] dark:text-white tabular-nums">
                    {issuedTicket.destinationCode}
                  </p>
                  <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                    {issuedTicket.destinationCity}
                  </p>
                  <p className="text-[15px] font-semibold text-[#111111] dark:text-white mt-1 tabular-nums">
                    {issuedTicket.arrivalTime}
                  </p>
                </div>
              </div>

              {/* Ticket Meta Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                    {tt.passengerLabel}
                  </p>
                  <p className="text-[14px] font-medium text-[#111111] dark:text-white mt-0.5">
                    {issuedTicket.passengerName}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                    {tt.cabinLabel}
                  </p>
                  <p className="text-[14px] font-medium text-[#111111] dark:text-white mt-0.5">
                    {issuedTicket.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                    {tt.passengersCountLabel}
                  </p>
                  <p className="text-[14px] font-medium text-[#111111] dark:text-white mt-0.5 tabular-nums">
                    {issuedTicket.passengers}
                    {issuedTicket.passportLast4 ? ` · •••• ${issuedTicket.passportLast4}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                    {tt.totalPaidLabel}
                  </p>
                  <p className="text-[18px] font-semibold text-[#FF8A00] mt-0.5 tabular-nums">
                    ${issuedTicket.totalPriceUsd}
                  </p>
                </div>
              </div>

              {/* AI-Generated Flight Preparation Brief */}
              {issuedTicket.aiBrief && (
                <div className="rounded-[20px] bg-[#0B1F5C]/[0.04] dark:bg-white/[0.04] border border-[#0B1F5C]/12 dark:border-white/12 p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0B1F5C] dark:text-white">
                      <Sparkles className="w-4 h-4 text-[#FF8A00]" />
                      <span>{tt.aiBriefTitle}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#5A5A56] dark:text-[#A1A7B8]">
                      {issuedTicket.aiBrief.preparedByModel}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-[#111111] dark:text-[#F4F5F7] leading-relaxed">
                    {issuedTicket.aiBrief.boardingSummary}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="rounded-xl bg-white dark:bg-[#0B0E17] p-3 border border-black/5 dark:border-white/8">
                      <p className="text-[11px] uppercase tracking-wider text-[#FF8A00] font-semibold">
                        {tt.aiCheckInLabel}
                      </p>
                      <p className="text-[12.5px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 leading-relaxed">
                        {issuedTicket.aiBrief.checkInNote}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-[#0B0E17] p-3 border border-black/5 dark:border-white/8">
                      <p className="text-[11px] uppercase tracking-wider text-[#FF8A00] font-semibold">
                        {tt.aiBaggageLabel}
                      </p>
                      <p className="text-[12.5px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 leading-relaxed">
                        {issuedTicket.aiBrief.baggageAdvice}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-[#0B0E17] p-3 border border-black/5 dark:border-white/8">
                      <p className="text-[11px] uppercase tracking-wider text-[#FF8A00] font-semibold">
                        {tt.aiArrivalLabel}
                      </p>
                      <p className="text-[12.5px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 leading-relaxed">
                        {issuedTicket.aiBrief.arrivalTip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scannable Verification URL QR Code Stub */}
            <div className="lg:border-s lg:border-dashed lg:border-black/15 dark:lg:border-white/18 lg:ps-7 flex flex-col items-center text-center gap-2.5">
              <div className="rounded-[20px] bg-white p-3.5 border border-black/10 shadow-sm">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR ${issuedTicket.pnrCode}`}
                    className="w-[152px] h-[152px] block"
                  />
                ) : (
                  <div className="w-[152px] h-[152px] flex items-center justify-center text-[#0B1F5C]">
                    <QrCode className="w-16 h-16" />
                  </div>
                )}
              </div>
              <p className="text-[11px] font-semibold font-mono tracking-wider text-[#0B1F5C] dark:text-white uppercase tabular-nums">
                {issuedTicket.pnrCode}
              </p>
              <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] max-w-[180px]">
                {tt.qrVerifyNote}
              </p>
              <Link
                to={`/ticket/${issuedTicket.pnrCode}`}
                className="print:hidden inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#FF8A00] hover:underline mt-0.5"
              >
                <span>{tt.openVerifyPageBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="print:hidden px-6 sm:px-8 py-4 bg-[#F6F5F2] dark:bg-[#0B0E17] border-t border-black/6 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#141926] border border-black/10 dark:border-white/15 px-4 py-2.5 min-h-[42px] text-[13px] font-medium text-[#111111] dark:text-white hover:border-[#0B1F5C] dark:hover:border-[#FF8A00] transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{tt.printBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTicket}
                className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#141926] border border-black/10 dark:border-white/15 px-4 py-2.5 min-h-[42px] text-[13px] font-medium text-[#111111] dark:text-white hover:border-[#0B1F5C] dark:hover:border-[#FF8A00] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? tt.copiedBtn : tt.copyBtn}</span>
              </button>

              <a
                href={buildTelegramDraftUrl(ticketTelegramText)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  saveLatestTelegramDraft(ticketTelegramText);
                  copyTextSafely(ticketTelegramText);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#FF8A00] hover:bg-[#e57c00] text-white px-5 py-2.5 min-h-[42px] text-[13px] font-semibold transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{tt.telegramBtn}</span>
              </a>

              <a
                href={buildTelegramAppUrl(ticketTelegramText)}
                onClick={() => {
                  saveLatestTelegramDraft(ticketTelegramText);
                  copyTextSafely(ticketTelegramText);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1F5C]/10 dark:bg-white/10 text-[#0B1F5C] dark:text-white px-4 py-2.5 min-h-[42px] text-[12px] font-medium hover:bg-[#0B1F5C] hover:text-white dark:hover:bg-[#FF8A00] transition-colors"
              >
                <span>{tt.telegramAppBtn}</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIssuedTicket(null)}
              className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white underline cursor-pointer"
            >
              {tt.bookAnotherBtn}
            </button>
          </div>
        </div>
      )}

      {/* Flights List + Passenger Booking Form */}
      <div className="print:hidden grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Flight Schedules List */}
        <div className="lg:col-span-7 space-y-3.5">
          {matchingFlights.length === 0 ? (
            <div className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-10 border border-black/6 dark:border-white/10 text-center text-[#5A5A56] dark:text-[#A1A7B8]">
              {tt.noFlightsFound}
            </div>
          ) : (
            matchingFlights.map((flight) => {
              const isSelected = selectedFlight?.id === flight.id;
              const pricing = calculateFlightTotalUsd(flight, cabin, passengers);
              return (
                <article
                  key={flight.id}
                  onClick={() => setSelectedFlightId(flight.id)}
                  className={`rounded-[24px] p-5 sm:p-6 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#141926] border-[#FF8A00] ring-2 ring-[#FF8A00]/25 shadow-[0_14px_34px_rgba(255,138,0,0.12)]'
                      : 'bg-white/95 dark:bg-[#141926]/95 border-black/6 dark:border-white/10 hover:border-[#0B1F5C]/30 dark:hover:border-white/25'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1F5C]/8 dark:bg-white/10 px-3 py-1 text-[12px] font-semibold text-[#0B1F5C] dark:text-white">
                        <Plane className="w-3.5 h-3.5 text-[#FF8A00]" />
                        {flight.airline}
                      </span>
                      <span className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                        {flight.flightNumber}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        flight.stops === 0
                          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/12 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {flight.stops === 0
                        ? tt.directFlight
                        : `${tt.oneStop}${flight.stopCode ? ` (${flight.stopCode})` : ''}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-[210px]">
                      <div>
                        <p className="text-[22px] font-semibold text-[#111111] dark:text-white tabular-nums">
                          {flight.departureTime}
                        </p>
                        <p className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                          {flight.originCode}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                          {formatDuration(flight.durationMinutes)}
                        </span>
                        <div className="w-full flex items-center gap-1.5">
                          <span className="h-[1.5px] flex-1 bg-black/15 dark:bg-white/20" />
                          <ArrowRight className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                        </div>
                        <span className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] inline-flex items-center gap-1">
                          <Luggage className="w-3 h-3 text-[#FF8A00]" />
                          {tt.baggageLabel}: {flight.baggageKg} kg
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-[22px] font-semibold text-[#111111] dark:text-white tabular-nums">
                          {flight.arrivalTime}
                        </p>
                        <p className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                          {flight.destinationCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/6 dark:border-white/10">
                      <div className="sm:text-right">
                        <p className="text-[22px] font-semibold text-[#FF8A00] tabular-nums">
                          ${pricing.totalPriceUsd}
                        </p>
                        <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                          ${pricing.unitPriceUsd} / {tt.perPassenger}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFlightId(flight.id);
                        }}
                        className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                            : 'bg-[#F6F5F2] dark:bg-white/10 text-[#111111] dark:text-white hover:bg-[#0B1F5C] hover:text-white dark:hover:bg-[#FF8A00]'
                        }`}
                      >
                        {isSelected ? tt.selectedFlightBtn : tt.selectFlightBtn}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Step 1: Passenger Booking Form */}
        <form
          onSubmit={handleReserveSubmit}
          className="lg:col-span-5 rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-6 sm:p-7 border border-black/6 dark:border-white/10 shadow-[0_14px_38px_rgba(11,31,92,0.06)] space-y-5 lg:sticky lg:top-28"
        >
          <div className="space-y-1.5">
            <h3 className="text-[20px] font-medium text-[#111111] dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF8A00]" />
              <span>{tt.passengerFormTitle}</span>
            </h3>
            <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
              {tt.passengerFormSubtitle}
            </p>
          </div>

          {selectedFlight && selectedPricing && (
            <div className="rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] p-4 border border-black/5 dark:border-white/8 flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-[#111111] dark:text-white">
                  {selectedFlight.originCode} → {selectedFlight.destinationCode}{' '}
                  {selectedDestination ? `(${selectedDestination.cityNames[lang]})` : ''}
                </p>
                <p className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                  {selectedFlight.airline} · {selectedFlight.flightNumber} · {departureDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8]">
                  {tt.totalPriceLabel}
                </p>
                <p className="text-[20px] font-bold text-[#FF8A00] tabular-nums">
                  ${selectedPricing.totalPriceUsd}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3.5">
            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium text-[#111111] dark:text-white">
                {tt.passengerNameLabel} *
              </span>
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder={tt.passengerNamePlaceholder}
                className="w-full rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 px-4 py-3 min-h-[46px] text-[14px] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium text-[#111111] dark:text-white">
                {tt.phoneLabel} *
              </span>
              <input
                type="tel"
                required
                maxLength={32}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={tt.phonePlaceholder}
                className="w-full rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 px-4 py-3 min-h-[46px] text-[14px] text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium text-[#111111] dark:text-white">
                {tt.passportLabel}
              </span>
              <input
                type="text"
                maxLength={20}
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                placeholder={tt.passportPlaceholder}
                className="w-full rounded-2xl bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 px-4 py-3 min-h-[46px] text-[14px] uppercase text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
              />
              <span className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {tt.passportHint}
              </span>
            </label>
          </div>

          {errorMsg && (
            <p
              role="alert"
              className="rounded-2xl bg-red-500/10 border border-red-500/25 px-4 py-2.5 text-[13px] text-red-600 dark:text-red-400"
            >
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedFlight}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] hover:bg-[#FF8A00] dark:hover:bg-[#e57c00] text-white font-medium px-6 py-3.5 min-h-[50px] text-[15px] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>{submitting ? tt.issuingBtn : tt.issueBtn}</span>
          </button>

          <p className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8] text-center">
            {tt.telegramDraftHint}
          </p>
        </form>
      </div>
    </div>
  );
}
