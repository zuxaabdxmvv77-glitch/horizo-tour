import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {SITE_MEDIA} from '../../data/siteConfig';
import {Reveal, SafeImage} from '../MotionPrimitives';
import {PillButton} from '../PillButton';

export function IntroExploreSection() {
  const {t} = useLanguage();

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
        {/* Left Copy + CTA */}
        <div className="lg:col-span-5 rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-6">
          <Reveal>
            <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">{t.intro.label}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-[clamp(1.85rem,3.4vw,3.1rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
              {t.intro.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <PillButton label={t.intro.cta} to="/contact" />
          </Reveal>
        </div>

        {/* Right Side: Two Rounded Images Side by Side */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Left Card -> /gallery */}
          <Reveal delay={0.12}>
            <Link
              to="/gallery"
              className="group relative block overflow-hidden rounded-[24px] md:rounded-[28px] aspect-[4/5] bg-white"
            >
              <SafeImage
                src={SITE_MEDIA.introLeftPhoto}
                alt={t.intro.leftCaption}
                width={640}
                height={800}
                className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3 text-white">
                <p className="text-[15px] font-normal leading-snug max-w-[200px]">
                  {t.intro.leftCaption}
                </p>
                <span
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full bg-white text-[#0B1F5C] flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#FF8A00] group-hover:text-white"
                >
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Right Card with "Yo'nalish" badge */}
          <Reveal delay={0.2}>
            <Link
              to="/tours"
              className="group relative block overflow-hidden rounded-[24px] md:rounded-[28px] aspect-[4/5] bg-white sm:translate-y-4"
            >
              <SafeImage
                src={SITE_MEDIA.introRightPhoto}
                alt={t.intro.rightCaption}
                width={640}
                height={800}
                className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-sm text-[#0B1F5C] px-3.5 py-1.5 text-[12px] font-medium">
                {t.intro.rightBadge}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[15px] font-normal leading-snug">{t.intro.rightCaption}</p>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
