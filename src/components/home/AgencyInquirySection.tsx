import React, {useEffect, useState} from 'react';
import {Check, CheckCircle2, Clock, Compass, Copy, ShieldCheck} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {TOURS} from '../../data/tours';
import {submitInquiry} from '../../services/inquiriesApi';
import {
  buildTelegramAppUrl,
  buildTelegramDraftUrl,
  openTelegramWithDraft,
  saveLatestTelegramDraft,
} from '../../utils/telegramDraft';
import {Reveal} from '../MotionPrimitives';
import {PillButton} from '../PillButton';

export function AgencyInquirySection() {
  const {lang, t, buildInquiryText} = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationSlug, setDestinationSlug] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{name?: string; phone?: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [savedSummary, setSavedSummary] = useState<{
    name: string;
    phone: string;
    destinationLabel: string;
    plainText: string;
    telegramUrl: string;
    telegramAppUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!name.trim() && !phone.trim() && !destinationSlug && !message.trim()) return;
    const chosenTour = TOURS.find((item) => item.slug === destinationSlug);
    const destinationLabel = chosenTour ? chosenTour.name[lang] : '-';
    saveLatestTelegramDraft(
      buildInquiryText({
        name: name.trim() || '-',
        phone: phone.trim() || '-',
        destination: destinationLabel,
        message: message.trim(),
      }),
    );
  }, [name, phone, destinationSlug, message, lang, buildInquiryText]);

  const trustItems = [
    {icon: ShieldCheck, text: t.inquirySection.trust1},
    {icon: Clock, text: t.inquirySection.trust2},
    {icon: Compass, text: t.inquirySection.trust3},
  ];

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
    const destinationLabel = chosenTour ? chosenTour.name[lang] : '-';
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    const plainText = buildInquiryText({
      name: trimmedName,
      phone: trimmedPhone,
      destination: destinationLabel,
      message: trimmedMessage,
    });

    // Open Telegram synchronously inside user gesture so draft is preserved and popup is never blocked
    openTelegramWithDraft(plainText);

    try {
      await submitInquiry({
        name: trimmedName,
        phone: trimmedPhone,
        destinationSlug,
        destinationLabel,
        message: trimmedMessage,
        source: 'home',
        lang,
      });

      setSavedSummary({
        name: trimmedName,
        phone: trimmedPhone,
        destinationLabel,
        plainText,
        telegramUrl: buildTelegramDraftUrl(plainText),
        telegramAppUrl: buildTelegramAppUrl(plainText),
      });
      setName('');
      setPhone('');
      setDestinationSlug('');
      setMessage('');
    } catch {
      setSubmitError(t.inquirySection.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!savedSummary) return;
    try {
      await navigator.clipboard.writeText(savedSummary.plainText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section id="inquiry" className="px-4 sm:px-6 lg:px-10 py-14 md:py-20">
      <div className="max-w-[1440px] mx-auto">
        <Reveal>
          <div className="rounded-[28px] md:rounded-[36px] bg-white/94 dark:bg-[#141926]/94 p-6 sm:p-10 lg:p-14 border border-black/6 dark:border-white/12 shadow-[0_18px_50px_rgba(11,31,92,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Copy & Trust Highlights */}
              <div className="lg:col-span-5 space-y-6">
                <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                  {t.inquirySection.label}
                </p>
                <h2 className="text-[clamp(1.8rem,3.3vw,3rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
                  {t.inquirySection.heading}
                </h2>
                <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed max-w-md">
                  {t.inquirySection.subtitle}
                </p>

                <ul className="space-y-3 pt-2">
                  {trustItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.text}
                        className="flex items-center gap-3 text-[14px] sm:text-[15px] text-[#111111] dark:text-[#F4F5F7]"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#FF8A00]/14 text-[#FF8A00] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right Interactive Agency Form */}
              <div className="lg:col-span-7">
                {savedSummary ? (
                  <div className="rounded-[24px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-6 sm:p-8 space-y-5 border border-black/5 dark:border-white/10">
                    <div className="w-12 h-12 rounded-full bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-light text-[#111111] dark:text-white">
                        {t.inquirySection.savedTitle}
                      </h3>
                      <p className="text-[14px] sm:text-[15px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                        {t.inquirySection.savedText}
                      </p>
                    </div>
                    <pre className="rounded-[16px] bg-white dark:bg-[#141926] p-4 text-[13px] text-[#111111] dark:text-[#F4F5F7] whitespace-pre-wrap font-sans leading-relaxed border border-black/5 dark:border-white/10">
                      {savedSummary.plainText}
                    </pre>
                    <div className="flex flex-wrap items-center gap-3">
                      <PillButton
                        label={t.inquirySection.optionalTelegram}
                        href={savedSummary.telegramUrl}
                        external
                        variant="navy"
                      />
                      <a
                        href={savedSummary.telegramAppUrl}
                        className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/20 px-4 py-2.5 min-h-[44px] text-[13px] font-medium text-[#111111] dark:text-white hover:border-[#FF8A00] transition-colors"
                      >
                        Telegram App
                      </a>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/20 px-4 py-2.5 min-h-[44px] text-[13px] font-medium text-[#111111] dark:text-white hover:border-[#0B1F5C] dark:hover:border-white transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 text-[#FF8A00]" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? t.contactPage.copiedText : t.contactPage.copyText}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSavedSummary(null)}
                        className="px-4 py-2.5 min-h-[44px] text-[14px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white cursor-pointer"
                      >
                        {t.contactPage.sendAnother}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="home-inquiry-name"
                          className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]"
                        >
                          {t.contactPage.nameLabel}
                        </label>
                        <input
                          id="home-inquiry-name"
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors((prev) => ({...prev, name: undefined}));
                          }}
                          placeholder={t.contactPage.namePlaceholder}
                          className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/6 dark:border-white/10 focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[48px] text-[15px] text-[#111111] dark:text-white focus:outline-none transition-colors"
                        />
                        {errors.name && <p className="text-[12px] text-red-500">{errors.name}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="home-inquiry-phone"
                          className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]"
                        >
                          {t.contactPage.phoneInputLabel}
                        </label>
                        <input
                          id="home-inquiry-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors((prev) => ({...prev, phone: undefined}));
                          }}
                          placeholder={t.contactPage.phonePlaceholder}
                          className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/6 dark:border-white/10 focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[48px] text-[15px] text-[#111111] dark:text-white tabular-nums focus:outline-none transition-colors"
                        />
                        {errors.phone && <p className="text-[12px] text-red-500">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="home-inquiry-destination"
                        className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]"
                      >
                        {t.contactPage.destinationLabel}
                      </label>
                      <select
                        id="home-inquiry-destination"
                        value={destinationSlug}
                        onChange={(e) => setDestinationSlug(e.target.value)}
                        className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/6 dark:border-white/10 focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[48px] text-[15px] text-[#111111] dark:text-white focus:outline-none transition-colors"
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
                      <label
                        htmlFor="home-inquiry-message"
                        className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]"
                      >
                        {t.contactPage.messageLabel}
                      </label>
                      <textarea
                        id="home-inquiry-message"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t.contactPage.messagePlaceholder}
                        className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/6 dark:border-white/10 focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 text-[15px] text-[#111111] dark:text-white focus:outline-none transition-colors resize-y"
                      />
                    </div>

                    {submitError && <p className="text-[13px] text-red-500">{submitError}</p>}

                    <div className="pt-2">
                      <PillButton
                        type="submit"
                        disabled={submitting}
                        label={submitting ? t.inquirySection.submitting : t.inquirySection.submitDirect}
                        variant="navy"
                      />
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
