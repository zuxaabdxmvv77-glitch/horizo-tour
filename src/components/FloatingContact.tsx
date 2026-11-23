import React from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {Phone, Send} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {SITE_CONTACT} from '../data/siteConfig';
import {
  buildTelegramDraftUrl,
  copyTextSafely,
  getLatestTelegramDraft,
} from '../utils/telegramDraft';

export function FloatingContact() {
  const {t} = useLanguage();
  const prefersReduced = useReducedMotion();

  const handleTelegramClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const draft = getLatestTelegramDraft(t.inquirySection.telegramGreeting);
    copyTextSafely(draft);
    e.currentTarget.href = buildTelegramDraftUrl(draft);
  };

  return (
    <motion.div
      initial={prefersReduced ? false : {opacity: 0, y: 18}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1]}}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2"
    >
      <a
        href={buildTelegramDraftUrl(t.inquirySection.telegramGreeting)}
        onClick={handleTelegramClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.floating.telegram}
        className="inline-flex items-center gap-2 rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-4 py-2.5 min-h-[44px] text-[13px] font-medium shadow-lg shadow-black/15 hover:bg-[#FF8A00] dark:hover:bg-[#e67c00] transition-colors duration-200 whitespace-nowrap"
      >
        <Send className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{t.floating.telegram}</span>
      </a>
      <a
        href={SITE_CONTACT.phoneHref}
        aria-label={t.floating.call}
        className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-[#141926] text-[#0B1F5C] dark:text-white border border-black/10 dark:border-white/15 shadow-lg shadow-black/10 hover:bg-[#FF8A00] hover:text-white hover:border-[#FF8A00] transition-colors duration-200"
      >
        <Phone className="w-4 h-4" />
      </a>
    </motion.div>
  );
}
