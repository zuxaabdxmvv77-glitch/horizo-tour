import React, {useEffect, useState} from 'react';
import {Check, CheckCircle2, Copy, Instagram, Mail, Phone, Send} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {SITE_CONTACT} from '../data/siteConfig';
import {TOURS} from '../data/tours';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {submitInquiry} from '../services/inquiriesApi';
import {
  buildTelegramAppUrl,
  buildTelegramDraftUrl,
  getLatestTelegramDraft,
  openTelegramWithDraft,
  saveLatestTelegramDraft,
} from '../utils/telegramDraft';
import {Reveal} from '../components/MotionPrimitives';
import {PillButton} from '../components/PillButton';

export function ContactPage() {
  const {lang, t, buildInquiryText} = useLanguage();
  useDocumentMeta(t.seo.contactTitle, t.contactPage.subtitle);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationSlug, setDestinationSlug] = useState('');
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
  }, [name, phone, destinationSlug, message, lang, buildInquiryText]);

  const contactCards = [
    {
      icon: Phone,
      label: t.contactPage.phoneLabel,
      value: SITE_CONTACT.phoneDisplay,
      href: SITE_CONTACT.phoneHref,
      external: false,
    },
    {
      icon: Send,
      label: t.contactPage.telegramLabel,
      value: SITE_CONTACT.telegramHandle,
      href: buildTelegramDraftUrl(
        getLatestTelegramDraft(t.inquirySection.telegramGreeting),
      ),
      external: true,
    },
    {
      icon: Instagram,
      label: t.contactPage.instagramLabel,
      value: SITE_CONTACT.instagramHandle,
      href: SITE_CONTACT.instagramHref,
      external: true,
    },
    {
      icon: Mail,
      label: t.contactPage.emailLabel,
      value: SITE_CONTACT.email,
      href: SITE_CONTACT.emailHref,
      external: false,
    },
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
    const destinationText = chosenTour ? chosenTour.name[lang] : '-';
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    const plainText = buildInquiryText({
      name: trimmedName,
      phone: trimmedPhone,
      destination: destinationText,
      message: trimmedMessage,
    });

    openTelegramWithDraft(plainText);

    try {
      await submitInquiry({
        name: trimmedName,
        phone: trimmedPhone,
        destinationSlug,
        destinationLabel: destinationText,
        message: trimmedMessage,
        source: 'contact',
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
      // Clipboard API unavailable
    }
  };

  return (
    <main className="pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto space-y-12">
        <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-3">
          <Reveal>
            <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
              {t.contactPage.label}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#111111] dark:text-white">
              {t.contactPage.title}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
              {t.contactPage.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Contact Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.label} delay={idx * 0.06}>
                  <a
                    href={card.href}
                    target={card.external ? '_blank' : undefined}
                    rel={card.external ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-4 rounded-[24px] bg-white/94 dark:bg-[#141926]/94 p-5 sm:p-6 border border-black/5 dark:border-white/10 hover:border-[#FF8A00]/50 transition-colors"
                  >
                    <span className="w-12 h-12 rounded-full bg-[#F6F5F2] dark:bg-[#0B0E17] text-[#0B1F5C] dark:text-white group-hover:bg-[#FF8A00] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8]">{card.label}</p>
                      <p className="text-[16px] sm:text-[17px] font-medium text-[#111111] dark:text-white truncate tabular-nums">
                        {card.value}
                      </p>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>

          {/* Right: Inquiry Form */}
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="rounded-[24px] md:rounded-[32px] bg-white/94 dark:bg-[#141926]/94 p-6 sm:p-10 border border-black/5 dark:border-white/10">
              {submittedPayload ? (
                <div className="py-6 space-y-6">
                  <div className="w-14 h-14 rounded-full bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-light text-[#111111] dark:text-white">
                      {t.contactPage.successTitle}
                    </h2>
                    <p className="text-[15px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed max-w-lg">
                      {t.contactPage.successText}
                    </p>
                  </div>

                  <pre className="rounded-[18px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-4 text-[13px] text-[#111111] dark:text-[#F4F5F7] whitespace-pre-wrap font-sans leading-relaxed border border-black/5 dark:border-white/10">
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
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/20 px-4 py-3 min-h-[44px] text-[14px] font-medium text-[#111111] dark:text-white hover:border-[#FF8A00] transition-colors"
                    >
                      Telegram App
                    </a>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/20 px-5 py-3 min-h-[44px] text-[14px] font-medium text-[#111111] dark:text-white hover:border-[#0B1F5C] dark:hover:border-white transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#FF8A00]" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? t.contactPage.copiedText : t.contactPage.copyText}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedPayload(null);
                        setName('');
                        setPhone('');
                        setDestinationSlug('');
                        setMessage('');
                      }}
                      className="text-[14px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white px-3 py-2 cursor-pointer"
                    >
                      {t.contactPage.sendAnother}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="space-y-1.5 pb-2">
                    <h2 className="text-2xl sm:text-3xl font-light text-[#111111] dark:text-white">
                      {t.contactPage.formTitle}
                    </h2>
                    <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">
                      {t.contactPage.formSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]">
                        {t.contactPage.nameLabel}
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({...prev, name: undefined}));
                        }}
                        placeholder={t.contactPage.namePlaceholder}
                        className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[46px] text-[15px] text-[#111111] dark:text-white focus:outline-none transition-colors"
                      />
                      {errors.name && (
                        <p className="text-[12px] text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label htmlFor="contact-phone" className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]">
                        {t.contactPage.phoneInputLabel}
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors((prev) => ({...prev, phone: undefined}));
                        }}
                        placeholder={t.contactPage.phonePlaceholder}
                        className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[46px] text-[15px] text-[#111111] dark:text-white tabular-nums focus:outline-none transition-colors"
                      />
                      {errors.phone && (
                        <p className="text-[12px] text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Destination Select */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-destination" className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]">
                      {t.contactPage.destinationLabel}
                    </label>
                    <select
                      id="contact-destination"
                      value={destinationSlug}
                      onChange={(e) => setDestinationSlug(e.target.value)}
                      className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 min-h-[46px] text-[15px] text-[#111111] dark:text-white focus:outline-none transition-colors"
                    >
                      <option value="">{t.contactPage.destinationPlaceholder}</option>
                      {TOURS.map((tour) => (
                        <option key={tour.slug} value={tour.slug}>
                          {tour.name[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]">
                      {t.contactPage.messageLabel}
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.contactPage.messagePlaceholder}
                      className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-transparent focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] focus:bg-white dark:focus:bg-[#0F1422] px-4 py-3 text-[15px] text-[#111111] dark:text-white focus:outline-none transition-colors resize-y"
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
          </Reveal>
        </div>
      </div>
    </main>
  );
}
