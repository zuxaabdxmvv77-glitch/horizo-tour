import React from 'react';
import {useLanguage} from '../context/LanguageContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal} from '../components/MotionPrimitives';
import {PillButton} from '../components/PillButton';

export function NotFoundPage() {
  const {t} = useLanguage();
  useDocumentMeta(t.seo.notFoundTitle);

  return (
    <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <Reveal>
          <div className="rounded-[28px] md:rounded-[36px] bg-white dark:bg-[#141926] px-6 py-16 sm:p-20 text-center space-y-6 border border-black/5 dark:border-white/10">
            <p className="text-[clamp(3.5rem,10vw,7rem)] font-light leading-none tracking-[-0.04em] text-[#0B1F5C] dark:text-[#FF8A00]">
              {t.notFound.code}
            </p>
            <h1 className="text-[clamp(1.75rem,3vw,2.6rem)] font-light text-[#111111] dark:text-white">
              {t.notFound.title}
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] max-w-md mx-auto leading-relaxed">
              {t.notFound.text}
            </p>
            <div className="pt-2">
              <PillButton label={t.notFound.cta} to="/" />
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
