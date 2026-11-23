import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  getLanguageMeta,
  isValidLanguage,
  Language,
  LanguageMeta,
  SUPPORTED_LANGUAGES,
} from '../i18n/languages';
import {translations, TranslationSchema} from '../i18n/translations';

interface InquiryTextParams {
  name: string;
  phone: string;
  destination: string;
  message: string;
}

interface LanguageContextValue {
  lang: Language;
  langMeta: LanguageMeta;
  languages: readonly LanguageMeta[];
  setLang: (lang: Language) => void;
  t: TranslationSchema;
  formatPrice: (priceUsd: number | null) => string;
  buildInquiryText: (params: InquiryTextParams) => string;
}

const STORAGE_KEY = 'horizo_lang';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return isValidLanguage(saved) ? saved : 'uz';
    } catch {
      return 'uz';
    }
  });

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures in restricted contexts
    }
  };

  const langMeta = getLanguageMeta(lang);
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = langMeta.dir;
  }, [lang, langMeta.dir]);

  const formatPrice = (priceUsd: number | null) => {
    if (priceUsd === null) {
      return t.common.priceOnRequest;
    }
    return t.common.priceFromTemplate.replace('{price}', String(priceUsd));
  };

  const buildInquiryText = ({name, phone, destination, message}: InquiryTextParams) => {
    return [
      t.inquirySection.telegramGreeting,
      `${t.contactPage.nameLabel}: ${name}`,
      `${t.contactPage.phoneInputLabel}: ${phone}`,
      `${t.contactPage.destinationLabel}: ${destination}`,
      `${t.contactPage.messageLabel}: ${message || '-'}`,
    ].join('\n');
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        langMeta,
        languages: SUPPORTED_LANGUAGES,
        setLang,
        t,
        formatPrice,
        buildInquiryText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
