import React from 'react';
import {useLanguage} from '../context/LanguageContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {FaqSection} from '../components/home/FaqSection';
import {FinalCtaSection} from '../components/home/FinalCtaSection';

export function FaqPage() {
  const {t} = useLanguage();
  useDocumentMeta(t.seo.faqTitle, t.faq.heading);

  return (
    <main className="pt-20 md:pt-24">
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
