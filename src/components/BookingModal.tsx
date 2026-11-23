import React, {useEffect, useState} from 'react';
import {Check, CheckCircle2, Copy, X} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {TOURS} from '../data/tours';
import {submitInquiry} from '../services/inquiriesApi';
import {
  buildTelegramAppUrl,
  buildTelegramDraftUrl,
  openTelegramWithDraft,
  saveLatestTelegramDraft,
} from '../utils/telegramDraft';
import {PillButton} from './PillButton';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestinationSlug?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  defaultDestinationSlug = '',
}: BookingModalProps) {
  const {lang, t, buildInquiryText} = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationSlug, setDestinationSlug] = useState(defaultDestinationSlug);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{name?: string; phone?: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedPayload, setSubmittedPayload] = useState<{
    telegramUrl: string;
    telegramAppUrl: string;
    plainText: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDestinationSlug(defaultDestinationSlug);
  }, [defaultDestinationSlug, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!name.trim() && !phone.trim() && !destinationSlug && !message.trim()) return;
    const chosenTour = TOURS.find((item) => item.slug === destinationSlug);
    const destinationText = chosenTour ? chosenTour.name[lang] : '-';
    saveLatestTelegramDraft(
      buildInquiryText({
        name: name.trim() || '-',
        phone: phone.trim() || '-',
        destination: destinationText,
        message: message.trim(),
      }),
    );
  }, [isOpen, name, phone, destinationSlug, message, lang, buildInquiryText]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: {name?: string; phone?: string} = {};
    const trimmedName = name.trim();
    const digitsOnly = phone.replace(/\D/g, '');

    if (!trimmedName) {
      nextErrors.name = t.contactPage.errorName;
    }
    if (digitsOnly.length < 9) {
      nextErrors.phone = t.contactPage.errorPhone;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError('');
    setSubmitting(true);

    const chosenTour = TOURS.find((item) => item.slug === destinationSlug);
    const destinationText = chosenTour ? chosenTour.name[lang] : '-';
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    const plainText = buildInquiryText({
      name: trimmedName,
      phone: trimmedPhone,
      destination: destinationText,
      message: trimmedMessage,
    });

    // Open Telegram synchronously inside user gesture so draft is preserved
    openTelegramWithDraft(plainText);

    try {
      await submitInquiry({
        name: trimmedName,
        phone: trimmedPhone,
        destinationSlug,
        destinationLabel: destinationText,
        message: trimmedMessage,
        source: 'modal',
        lang,
      });

      const telegramUrl = buildTelegramDraftUrl(plainText);
      const telegramAppUrl = buildTelegramAppUrl(plainText);
      setSubmittedPayload({telegramUrl, telegramAppUrl, plainText});
    } catch {
      setSubmitError(t.inquirySection.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!submittedPayload) return;
    try {
      await navigator.clipboard.writeText(submittedPayload.plainText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.contactPage.formTitle}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[28px] bg-white dark:bg-[#141926] text-[#111111] dark:text-[#F4F5F7] p-6 sm:p-8 shadow-2xl border border-black/8 dark:border-white/12 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#111111] dark:text-white hover:bg-[#FF8A00] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedPayload ? (
          <div className="py-2 space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 pr-8">
              <h2 className="text-2xl font-light">{t.contactPage.successTitle}</h2>
              <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                {t.contactPage.successText}
              </p>
            </div>

            <pre className="rounded-[18px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-4 text-[13px] whitespace-pre-wrap font-sans leading-relaxed border border-black/5 dark:border-white/10">
              {submittedPayload.plainText}
            </pre>

            <div className="flex flex-wrap items-center gap-3">
              <PillButton
                label={t.inquirySection.optionalTelegram}
                href={submittedPayload.telegramUrl}
                external
                variant="navy"
              />
              <a
                href={submittedPayload.telegramAppUrl}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/20 px-4 py-2.5 min-h-[44px] text-[13px] font-medium hover:border-[#FF8A00] transition-colors"
              >
                Telegram App
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/20 px-4 py-2.5 min-h-[44px] text-[13px] font-medium hover:border-[#0B1F5C] dark:hover:border-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#FF8A00]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.contactPage.copiedText : t.contactPage.copyText}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmittedPayload(null);
                setName('');
                setPhone('');
                setMessage('');
              }}
              className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white cursor-pointer"
            >
              {t.contactPage.sendAnother}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1 pr-10">
              <h2 className="text-2xl font-light">{t.contactPage.formTitle}</h2>
              <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.contactPage.formSubtitle}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-name" className="block text-[13px] font-medium">
                {t.contactPage.nameLabel}
              </label>
              <input
                id="modal-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({...prev, name: undefined}));
                }}
                placeholder={t.contactPage.namePlaceholder}
                className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[46px] text-[15px] focus:outline-none transition-colors"
              />
              {errors.name && <p className="text-[12px] text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-phone" className="block text-[13px] font-medium">
                {t.contactPage.phoneInputLabel}
              </label>
              <input
                id="modal-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({...prev, phone: undefined}));
                }}
                placeholder={t.contactPage.phonePlaceholder}
                className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[46px] text-[15px] tabular-nums focus:outline-none transition-colors"
              />
              {errors.phone && <p className="text-[12px] text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-destination" className="block text-[13px] font-medium">
                {t.contactPage.destinationLabel}
              </label>
              <select
                id="modal-destination"
                value={destinationSlug}
                onChange={(e) => setDestinationSlug(e.target.value)}
                className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[46px] text-[15px] focus:outline-none transition-colors"
              >
                <option value="">{t.contactPage.destinationPlaceholder}</option>
                {TOURS.map((tour) => (
                  <option key={tour.slug} value={tour.slug}>
                    {tour.name[lang]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-message" className="block text-[13px] font-medium">
                {t.contactPage.messageLabel}
              </label>
              <textarea
                id="modal-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.contactPage.messagePlaceholder}
                className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 text-[15px] focus:outline-none transition-colors resize-y"
              />
            </div>

            {submitError && <p className="text-[13px] text-red-500">{submitError}</p>}

            <div className="pt-2">
              <PillButton
                type="submit"
                disabled={submitting}
                label={submitting ? t.inquirySection.submitting : t.contactPage.submitBtn}
                variant="navy"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
