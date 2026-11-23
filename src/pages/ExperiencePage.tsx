import React from 'react';
import {useLanguage} from '../context/LanguageContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {ExperienceRowSection} from '../components/home/ExperienceRowSection';
import {FinalCtaSection} from '../components/home/FinalCtaSection';

export function ExperiencePage() {
  const {t} = useLanguage();
  useDocumentMeta(t.seo.experienceTitle, t.experience.heading);

  return (
    <main className="pt-20 md:pt-24">
      <ExperienceRowSection />
      <FinalCtaSection />
    </main>
  );
}
