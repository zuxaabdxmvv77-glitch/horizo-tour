import React, {useEffect, useMemo, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import QRCode from 'qrcode';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Luggage,
  Moon,
  Plane,
  Printer,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import {Logo} from '../components/Logo';
import {useLanguage} from '../context/LanguageContext';
import {useTheme} from '../context/ThemeContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {TICKET_TRANSLATIONS} from '../i18n/ticketTranslations';
import {TicketRecord, TicketStatus, verifyTicketByPnr} from '../services/ticketsApi';
import {
  buildTelegramAppUrl,
  buildTelegramDraftUrl,
  copyTextSafely,
  saveLatestTelegramDraft,
} from '../utils/telegramDraft';

function buildPublicTicketTelegramText(ticket: TicketRecord, cabinLabel: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return [
    `Horizo Tour · Rasmiy E-Ticket (${ticket.pnrCode})`,
    `Marshrut: ${ticket.originCode} -> ${ticket.destinationCode} (${ticket.destinationCity})`,
    `Reys: ${ticket.airline} · ${ticket.flightNumber}`,
    `Sana: ${ticket.departureDate} (${ticket.departureTime} - ${ticket.arrivalTime})`,
    `Klass: ${cabinLabel} | Yo'lovchilar: ${ticket.passengers}`,
    `Yo'lovchi: ${ticket.passengerName}`,
    ticket.passportLast4 ? `Hujjat: •••• ${ticket.passportLast4}` : null,
    `Jami summa: $${ticket.totalPriceUsd}`,
    origin ? `Tekshirish havolasi: ${origin}/ticket/${ticket.pnrCode}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function TicketVerifyPage() {
  const {pnr = ''} = useParams<{pnr: string}>();
  const {lang} = useLanguage();
  const {theme, toggleTheme} = useTheme();
  const tt = TICKET_TRANSLATIONS[lang] ?? TICKET_TRANSLATIONS.uz;

  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const normalizedPnr = pnr.trim().toUpperCase();
  useDocumentMeta(`${normalizedPnr || 'PNR'} — ${tt.verifyPageTitle}`, tt.verifyPageSubtitle);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    verifyTicketByPnr(normalizedPnr)
      .then((rec) => {
        if (active) {
          setTicket(rec);
        }
      })
      .catch(() => {
        if (active) {
          setTicket(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [normalizedPnr]);

  useEffect(() => {
    if (!ticket || typeof window === 'undefined') {
      setQrDataUrl('');
      return;
    }
    const verifyUrl = `${window.location.origin}/ticket/${ticket.pnrCode}`;
    let cancelled = false;
    QRCode.toDataURL(verifyUrl, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {dark: '#0B1F5C', light: '#FFFFFF'},
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [ticket]);

  const telegramText = useMemo(() => {
    if (!ticket) return '';
    const cabinText = ticket.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy;
    return buildPublicTicketTelegramText(ticket, cabinText);
  }, [ticket, tt.cabinBusiness, tt.cabinEconomy]);

  const statusMeta = (st: TicketStatus) => {
    switch (st) {
      case 'issued':
        return {
          label: tt.statusIssued,
          cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          valid: true,
        };
      case 'confirmed':
        return {
          label: tt.statusConfirmed,
          cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          valid: true,
        };
      case 'paid':
        return {
          label: tt.statusPaid,
          cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
          valid: true,
        };
      case 'pending_payment':
        return {
          label: tt.statusPendingPayment,
          cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          valid: false,
        };
      case 'expired':
        return {
          label: tt.statusExpired,
          cls: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
          valid: false,
        };
      case 'cancelled':
        return {
          label: tt.statusCancelled,
          cls: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
          valid: false,
        };
    }
  };

  const handleCopy = () => {
    if (!telegramText) return;
    copyTextSafely(telegramText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col text-[#111111] dark:text-[#F4F5F7]">
      {/* Minimal Header */}
      <header className="print:hidden px-4 sm:px-6 lg:px-10 py-5">
        <div className="max-w-[1040px] mx-auto rounded-full bg-white/85 dark:bg-[#141926]/85 backdrop-blur-xl border border-black/8 dark:border-white/12 px-5 py-3 flex items-center justify-between gap-4 shadow-[0_10px_30px_rgba(11,31,92,0.08)]">
          <Link to="/" className="shrink-0">
            <Logo variant={theme === 'dark' ? 'light' : 'dark'} />
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#111111] dark:text-white flex items-center justify-center hover:bg-[#FF8A00] hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/tours"
              className="rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-4 py-2 text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              {tt.verifyBackSiteBtn}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-10 pb-16 pt-2">
        <div className="max-w-[1040px] mx-auto space-y-6">
          {loading ? (
            <div className="rounded-[28px] bg-white/95 dark:bg-[#141926]/95 border border-black/8 dark:border-white/12 p-12 text-center shadow-[0_18px_50px_rgba(11,31,92,0.1)]">
              <div className="w-10 h-10 rounded-full border-2 border-[#FF8A00] border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">{tt.verifyPageTitle}...</p>
            </div>
          ) : notFound || !ticket ? (
            <div className="max-w-lg mx-auto rounded-[28px] bg-white/95 dark:bg-[#141926]/95 border border-black/8 dark:border-white/12 p-8 sm:p-10 text-center space-y-5 shadow-[0_18px_50px_rgba(11,31,92,0.1)]">
              <div className="w-14 h-14 rounded-full bg-red-500/12 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-[22px] font-medium text-[#111111] dark:text-white">
                  {tt.verifyNotFoundTitle}
                </h1>
                <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">{tt.verifyNotFoundText}</p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-6 py-3 text-[14px] font-medium"
              >
                {tt.verifyBackSiteBtn}
              </Link>
            </div>
          ) : (
            (() => {
              const badge = statusMeta(ticket.status);
              return (
                <div className="rounded-[28px] overflow-hidden border border-[#0B1F5C]/15 dark:border-white/15 bg-white/98 dark:bg-[#141926]/98 shadow-[0_24px_64px_rgba(11,31,92,0.16)]">
                  {/* Top Header Banner */}
                  <div className="bg-gradient-to-r from-[#0B1F5C] via-[#132F7A] to-[#0B1F5C] px-6 sm:px-8 py-6 text-white flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-[#FF8A00] flex items-center justify-center shrink-0">
                        {badge.valid ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <Clock className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/75 font-semibold">
                          HORIZO TOUR · {tt.verifyPageTitle}
                        </p>
                        <h1 className="text-[20px] sm:text-[24px] font-medium leading-tight">
                          {badge.valid ? tt.verifyAuthenticBadge : badge.label}
                        </h1>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full border px-3.5 py-1 text-[12px] font-semibold bg-white/95 dark:bg-[#0B0E17] ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      <div className="rounded-2xl bg-white/12 border border-white/20 px-4 py-2 text-right">
                        <p className="text-[10px] uppercase tracking-wider text-white/70">{tt.pnrLabel}</p>
                        <p className="text-[19px] font-bold tracking-wider text-[#FF8A00] font-mono tabular-nums">
                          {ticket.pnrCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Body */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-7 items-start">
                    <div className="space-y-6">
                      <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                        {tt.verifyPageSubtitle}
                      </p>

                      {/* Route Card */}
                      <div className="rounded-[20px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-5 border border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-5">
                        <div>
                          <p className="text-[30px] sm:text-[36px] font-semibold tracking-tight text-[#0B1F5C] dark:text-white tabular-nums">
                            {ticket.originCode}
                          </p>
                          <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                            {ticket.originCity}
                          </p>
                          <p className="text-[15px] font-semibold text-[#111111] dark:text-white mt-1 tabular-nums">
                            {ticket.departureTime}
                          </p>
                        </div>

                        <div className="flex-1 min-w-[130px] flex flex-col items-center gap-1.5 px-2">
                          <span className="text-[12px] font-medium text-[#FF8A00]">
                            {ticket.airline} · {ticket.flightNumber}
                          </span>
                          <div className="w-full flex items-center gap-2">
                            <span className="h-[2px] flex-1 bg-black/15 dark:bg-white/20 rounded-full" />
                            <Plane className="w-4 h-4 text-[#FF8A00] shrink-0" />
                            <span className="h-[2px] flex-1 bg-black/15 dark:bg-white/20 rounded-full" />
                          </div>
                          <span className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8] tabular-nums">
                            {ticket.departureDate}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-[30px] sm:text-[36px] font-semibold tracking-tight text-[#0B1F5C] dark:text-white tabular-nums">
                            {ticket.destinationCode}
                          </p>
                          <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                            {ticket.destinationCity}
                          </p>
                          <p className="text-[15px] font-semibold text-[#111111] dark:text-white mt-1 tabular-nums">
                            {ticket.arrivalTime}
                          </p>
                        </div>
                      </div>

                      {/* Passenger & Fare Meta */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                            {tt.passengerLabel}
                          </p>
                          <p className="text-[14px] font-medium text-[#111111] dark:text-white mt-0.5">
                            {ticket.passengerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                            {tt.cabinLabel}
                          </p>
                          <p className="text-[14px] font-medium text-[#111111] dark:text-white mt-0.5">
                            {ticket.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                            {tt.passengersCountLabel}
                          </p>
                          <p className="text-[14px] font-medium text-[#111111] dark:text-white mt-0.5 tabular-nums">
                            {ticket.passengers}
                            {ticket.passportLast4 ? ` · •••• ${ticket.passportLast4}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                            {tt.totalPaidLabel}
                          </p>
                          <p className="text-[18px] font-semibold text-[#FF8A00] mt-0.5 tabular-nums">
                            ${ticket.totalPriceUsd}
                          </p>
                        </div>
                      </div>

                      {/* AI-Prepared Flight Guidance */}
                      {ticket.aiBrief && (
                        <div className="rounded-[20px] bg-[#0B1F5C]/[0.04] dark:bg-white/[0.04] border border-[#0B1F5C]/12 dark:border-white/12 p-5 space-y-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0B1F5C] dark:text-white">
                              <Sparkles className="w-4 h-4 text-[#FF8A00]" />
                              <span>{tt.aiBriefTitle}</span>
                            </div>
                            <span className="text-[11px] font-mono text-[#5A5A56] dark:text-[#A1A7B8]">
                              {ticket.aiBrief.preparedByModel}
                            </span>
                          </div>
                          <p className="text-[14px] text-[#111111] dark:text-[#F4F5F7] leading-relaxed">
                            {ticket.aiBrief.boardingSummary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            <div className="rounded-xl bg-white dark:bg-[#141926] p-3 border border-black/5 dark:border-white/8">
                              <p className="text-[11px] uppercase tracking-wider text-[#FF8A00] font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {tt.aiCheckInLabel}
                              </p>
                              <p className="text-[12.5px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 leading-relaxed">
                                {ticket.aiBrief.checkInNote}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white dark:bg-[#141926] p-3 border border-black/5 dark:border-white/8">
                              <p className="text-[11px] uppercase tracking-wider text-[#FF8A00] font-semibold flex items-center gap-1">
                                <Luggage className="w-3.5 h-3.5" />
                                {tt.aiBaggageLabel}
                              </p>
                              <p className="text-[12.5px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 leading-relaxed">
                                {ticket.aiBrief.baggageAdvice}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white dark:bg-[#141926] p-3 border border-black/5 dark:border-white/8">
                              <p className="text-[11px] uppercase tracking-wider text-[#FF8A00] font-semibold flex items-center gap-1">
                                <Plane className="w-3.5 h-3.5" />
                                {tt.aiArrivalLabel}
                              </p>
                              <p className="text-[12.5px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 leading-relaxed">
                                {ticket.aiBrief.arrivalTip}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Verification QR Code */}
                    <div className="lg:border-s lg:border-dashed lg:border-black/15 dark:lg:border-white/18 lg:ps-7 flex flex-col items-center text-center gap-2.5 mx-auto">
                      <div className="rounded-[20px] bg-white p-3.5 border border-black/10 shadow-sm">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR ${ticket.pnrCode}`}
                            className="w-[152px] h-[152px] block"
                          />
                        ) : (
                          <div className="w-[152px] h-[152px] flex items-center justify-center text-[#0B1F5C]">
                            <QrCode className="w-16 h-16" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold font-mono tracking-wider text-[#0B1F5C] dark:text-white uppercase tabular-nums">
                        {ticket.pnrCode}
                      </p>
                      <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] max-w-[180px]">
                        {tt.qrVerifyNote}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
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
                        onClick={handleCopy}
                        className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#141926] border border-black/10 dark:border-white/15 px-4 py-2.5 min-h-[42px] text-[13px] font-medium text-[#111111] dark:text-white hover:border-[#0B1F5C] dark:hover:border-[#FF8A00] transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? tt.copiedBtn : tt.copyBtn}</span>
                      </button>

                      <a
                        href={buildTelegramDraftUrl(telegramText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          saveLatestTelegramDraft(telegramText);
                          copyTextSafely(telegramText);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#FF8A00] hover:bg-[#e57c00] text-white px-5 py-2.5 min-h-[42px] text-[13px] font-semibold transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>{tt.telegramBtn}</span>
                      </a>

                      <a
                        href={buildTelegramAppUrl(telegramText)}
                        onClick={() => {
                          saveLatestTelegramDraft(telegramText);
                          copyTextSafely(telegramText);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1F5C]/10 dark:bg-white/10 text-[#0B1F5C] dark:text-white px-4 py-2.5 min-h-[42px] text-[12px] font-medium hover:bg-[#0B1F5C] hover:text-white dark:hover:bg-[#FF8A00] transition-colors"
                      >
                        <span>{tt.telegramAppBtn}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </main>
    </div>
  );
}
