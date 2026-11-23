import React from 'react';
import {useLanguage} from '../context/LanguageContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal} from '../components/MotionPrimitives';
import {PillButton} from '../components/PillButton';

interface LegalPageProps {
  mode: 'privacy' | 'terms';
}

export function LegalPage({mode}: LegalPageProps) {
  const {t} = useLanguage();

  const title = mode === 'privacy' ? t.legal.privacyTitle : t.legal.termsTitle;
  const sections = mode === 'privacy' ? t.legal.privacySections : t.legal.termsSections;

  useDocumentMeta(mode === 'privacy' ? t.seo.privacyTitle : t.seo.termsTitle, t.seo.homeDescription);

  return (
    <main className="pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <Reveal>
          <div className="rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-3">
            <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
              {t.legal.updated}
            </p>
            <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-light leading-[1.1] tracking-[-0.03em] text-[#111111] dark:text-white">
              {title}
            </h1>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-[24px] md:rounded-[30px] bg-white dark:bg-[#141926] p-6 sm:p-10 border border-black/5 dark:border-white/10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-2.5">
                <h2 className="text-xl font-medium text-[#111111] dark:text-white">
                  {section.title}
                </h2>
                <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))}

            <div className="pt-4 border-t border-black/8 dark:border-white/10">
              <PillButton label={t.common.backHome} to="/" />
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
