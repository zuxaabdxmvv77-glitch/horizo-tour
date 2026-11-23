import React from 'react';
import {HeartHandshake, ShieldCheck, Sparkles} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {SITE_MEDIA} from '../data/siteConfig';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal, SafeImage} from '../components/MotionPrimitives';
import {TeamSection} from '../components/home/TeamSection';
import {FinalCtaSection} from '../components/home/FinalCtaSection';

export function AboutPage() {
  const {t} = useLanguage();
  useDocumentMeta(t.seo.aboutTitle, t.aboutPage.storyText);

  const values = [
    {
      icon: ShieldCheck,
      title: t.aboutPage.value1Title,
      desc: t.aboutPage.value1Desc,
    },
    {
      icon: Sparkles,
      title: t.aboutPage.value2Title,
      desc: t.aboutPage.value2Desc,
    },
    {
      icon: HeartHandshake,
      title: t.aboutPage.value3Title,
      desc: t.aboutPage.value3Desc,
    },
  ];

  return (
    <main className="pt-28 md:pt-36">
      {/* Story Block */}
      <section className="px-4 sm:px-6 lg:px-10 pb-12 md:pb-16">
        <div className="max-w-[1440px] mx-auto space-y-10">
          <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-4">
            <Reveal>
              <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.aboutPage.label}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#111111] dark:text-white">
                {t.aboutPage.title}
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-[16px] sm:text-[18px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                {t.aboutPage.storyText}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <div className="overflow-hidden rounded-[24px] md:rounded-[32px] aspect-[16/9] lg:aspect-[21/9] bg-[#0B1F5C]">
              <SafeImage
                src={SITE_MEDIA.teamGroupPhoto}
                alt={t.aboutPage.title}
                loading="eager"
                width={1600}
                height={720}
                className="w-full h-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values Row */}
      <section className="px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto space-y-8">
          <div className="max-w-2xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 px-6 py-5 sm:px-8 sm:py-6 border border-black/5 dark:border-white/10">
            <Reveal>
              <h2 className="text-[clamp(1.75rem,3vw,2.6rem)] font-light text-[#111111] dark:text-white">
                {t.aboutPage.valuesTitle}
              </h2>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <Reveal key={val.title} delay={idx * 0.08}>
                  <div className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-7 border border-black/5 dark:border-white/10 h-full space-y-4">
                    <span className="w-12 h-12 rounded-full bg-[#F6F5F2] dark:bg-[#0B0E17] text-[#FF8A00] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="text-xl font-medium text-[#111111] dark:text-white">
                      {val.title}
                    </h3>
                    <p className="text-[15px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection showGroupIntro={false} />

      {/* CTA */}
      <FinalCtaSection />
    </main>
  );
}
