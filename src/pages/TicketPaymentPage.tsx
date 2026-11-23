import React, {useCallback, useEffect, useState} from 'react';
import {Link, useParams, useSearchParams} from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Moon,
  Plane,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import {Logo} from '../components/Logo';
import {useLanguage} from '../context/LanguageContext';
import {useTheme} from '../context/ThemeContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {TICKET_TRANSLATIONS} from '../i18n/ticketTranslations';
import {
  confirmTicketPayment,
  fetchPaymentStatus,
  TicketPaymentStatusResponse,
  TicketStatus,
} from '../services/ticketsApi';

function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TicketPaymentPage() {
  const {pnr = ''} = useParams<{pnr: string}>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const {lang} = useLanguage();
  const {theme, toggleTheme} = useTheme();
  const tt = TICKET_TRANSLATIONS[lang] ?? TICKET_TRANSLATIONS.uz;

  const normalizedPnr = pnr.trim().toUpperCase();
  useDocumentMeta(`${normalizedPnr || 'PAY'} — ${tt.mobilePayTitle}`, tt.paymentSubtitle);

  const [paymentInfo, setPaymentInfo] = useState<TicketPaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [aiPendingRetry, setAiPendingRetry] = useState(false);
  const [issuedDone, setIssuedDone] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!normalizedPnr || !token) {
      setErrorCode('INVALID_PAYMENT_TOKEN');
      setLoading(false);
      return;
    }
    try {
      const data = await fetchPaymentStatus(normalizedPnr, token);
      setPaymentInfo(data);
      setRemainingSeconds(data.remainingSeconds);
      if (data.status === 'issued' || data.status === 'confirmed') {
        setIssuedDone(true);
      } else if (data.status === 'paid') {
        setAiPendingRetry(true);
      }
      setErrorCode('');
    } catch (err) {
      setErrorCode(err instanceof Error ? err.message : 'PAYMENT_STATUS_FAILED');
    } finally {
      setLoading(false);
    }
  }, [normalizedPnr, token]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!paymentInfo || paymentInfo.status !== 'pending_payment') return;
    const expiresMs = Date.parse(paymentInfo.paymentExpiresAt);
    if (Number.isNaN(expiresMs)) return;

    const tick = () => {
      const next = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0) {
        setPaymentInfo((prev) => (prev ? {...prev, status: 'expired'} : prev));
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [paymentInfo?.paymentExpiresAt, paymentInfo?.status]);

  const handleConfirm = async () => {
    if (!normalizedPnr || !token || confirming) return;
    setConfirming(true);
    setErrorCode('');
    try {
      const {ticket} = await confirmTicketPayment(normalizedPnr, token);
      setPaymentInfo((prev) =>
        prev
          ? {
              ...prev,
              status: ticket.status,
              paidAt: ticket.paidAt,
              aiBrief: ticket.aiBrief,
            }
          : prev,
      );
      setAiPendingRetry(false);
      setIssuedDone(true);
    } catch (err) {
      const typedErr = err as Error & {ticketStatus?: TicketStatus};
      if (typedErr.ticketStatus === 'paid') {
        setAiPendingRetry(true);
        setPaymentInfo((prev) => (prev ? {...prev, status: 'paid'} : prev));
      } else if (typedErr.message === 'PAYMENT_EXPIRED') {
        setPaymentInfo((prev) => (prev ? {...prev, status: 'expired'} : prev));
        setRemainingSeconds(0);
      }
      setErrorCode(typedErr.message || 'CONFIRM_FAILED');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col text-[#111111] dark:text-[#F4F5F7]">
      <header className="px-4 sm:px-6 lg:px-10 py-5">
        <div className="max-w-[760px] mx-auto rounded-full bg-white/85 dark:bg-[#141926]/85 backdrop-blur-xl border border-black/8 dark:border-white/12 px-5 py-3 flex items-center justify-between gap-4 shadow-[0_10px_30px_rgba(11,31,92,0.08)]">
          <Link to="/" className="shrink-0">
            <Logo variant={theme === 'dark' ? 'light' : 'dark'} />
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#111111] dark:text-white flex items-center justify-center hover:bg-[#FF8A00] hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 pb-16 pt-2 flex items-start justify-center">
        <div className="w-full max-w-[600px] rounded-[28px] bg-white/98 dark:bg-[#141926]/98 border border-black/8 dark:border-white/12 p-6 sm:p-8 shadow-[0_24px_60px_rgba(11,31,92,0.14)] space-y-6">
          {loading ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#FF8A00] border-t-transparent animate-spin mx-auto" />
              <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">{tt.mobilePayTitle}...</p>
            </div>
          ) : !paymentInfo ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/12 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h1 className="text-[20px] font-medium text-[#111111] dark:text-white">
                {tt.verifyNotFoundTitle}
              </h1>
              <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">{tt.verifyNotFoundText}</p>
              <Link
                to="/tours"
                className="inline-flex items-center justify-center rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-6 py-3 text-[14px] font-medium"
              >
                {tt.verifyBackSiteBtn}
              </Link>
            </div>
          ) : issuedDone ? (
            <div className="py-4 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#FF8A00]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{paymentInfo.pnrCode}</span>
                </span>
                <h1 className="text-[22px] sm:text-[26px] font-medium text-[#111111] dark:text-white">
                  {tt.mobilePaySuccessTitle}
                </h1>
                <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">
                  {tt.mobilePaySuccessText}
                </p>
              </div>
              <Link
                to={`/ticket/${paymentInfo.pnrCode}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] hover:opacity-95 text-white px-7 py-3.5 text-[15px] font-semibold transition-opacity"
              >
                <span>{tt.openVerifyPageBtn}</span>
              </Link>
            </div>
          ) : paymentInfo.status === 'expired' || paymentInfo.status === 'cancelled' ? (
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/12 text-red-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h1 className="text-[21px] font-medium text-[#111111] dark:text-white">
                {tt.paymentExpiredTitle}
              </h1>
              <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">{tt.paymentExpiredText}</p>
              <Link
                to="/tours"
                className="inline-flex items-center justify-center rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-6 py-3 text-[14px] font-medium"
              >
                {tt.paymentRetryBookingBtn}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[#FF8A00]">
                    {tt.paymentStageBadge}
                  </p>
                  <h1 className="text-[22px] font-medium text-[#111111] dark:text-white mt-1">
                    {tt.mobilePayTitle}
                  </h1>
                </div>
                <div className="rounded-2xl bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-4 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider opacity-80">
                    {tt.paymentCountdownLabel}
                  </p>
                  <p className="text-[20px] font-bold font-mono tabular-nums">
                    {formatCountdown(remainingSeconds)}
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-4 sm:p-5 border border-black/5 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#111111] dark:text-white">
                    <Plane className="w-4 h-4 text-[#FF8A00]" />
                    <span>
                      {paymentInfo.originCode} → {paymentInfo.destinationCode} ({paymentInfo.destinationCity})
                    </span>
                  </div>
                  <span className="font-mono text-[13px] font-bold text-[#0B1F5C] dark:text-[#FF8A00]">
                    {paymentInfo.pnrCode}
                  </span>
                </div>
                <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                  {paymentInfo.airline} · {paymentInfo.flightNumber} · {paymentInfo.departureDate} (
                  {paymentInfo.departureTime}–{paymentInfo.arrivalTime})
                </p>
                <div className="pt-2 border-t border-black/6 dark:border-white/10 flex items-center justify-between text-[14px]">
                  <span className="text-[#5A5A56] dark:text-[#A1A7B8]">
                    {paymentInfo.passengerName} ({paymentInfo.passengers})
                  </span>
                  <span className="text-[20px] font-bold text-[#FF8A00] tabular-nums">
                    ${paymentInfo.totalPriceUsd}
                  </span>
                </div>
              </div>

              {errorCode && (
                <div
                  role="alert"
                  className="rounded-2xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-[13px] text-red-600 dark:text-red-400"
                >
                  {tt.issueError} ({errorCode})
                </div>
              )}

              <button
                type="button"
                disabled={confirming}
                onClick={() => void handleConfirm()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] hover:bg-[#FF8A00] dark:hover:bg-[#e57c00] text-white font-semibold px-6 py-4 min-h-[52px] text-[15px] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {confirming ? (
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
