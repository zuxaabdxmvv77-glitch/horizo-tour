import React from 'react';
import {Check, Star} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {REVIEWS} from '../../data/reviews';
import {SITE_MEDIA} from '../../data/siteConfig';
import {CountUp, Reveal, SafeImage} from '../MotionPrimitives';
import {PillButton} from '../PillButton';

export function TestimonialsSection() {
  const {lang, t} = useLanguage();

  const loopedReviews = [...REVIEWS, ...REVIEWS];
  const bullets = [t.testimonials.bullet1, t.testimonials.bullet2, t.testimonials.bullet3];

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-10 md:py-14">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Top Row */}
        <div className="rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-5 sm:p-7 border border-black/5 dark:border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <Reveal>
              <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.testimonials.label}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
                {t.testimonials.heading}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <div className="flex flex-col items-start md:items-end gap-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-[#FF8A00]" aria-label="5.0 out of 5 stars">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-lg font-semibold text-[#111111] dark:text-white tabular-nums">
                  {t.testimonials.ratingValue}
                </span>
              </div>
              <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.testimonials.ratingLabel}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Compact 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Card: Star Rating + 10+ Stat + Bullets + CTA */}
          <Reveal className="lg:col-span-4">
            <div className="rounded-[24px] md:rounded-[28px] bg-white/95 dark:bg-[#141926]/95 p-6 sm:p-7 h-full flex flex-col justify-between gap-6 border border-black/5 dark:border-white/10">
              <div className="space-y-5">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <div className="text-[40px] sm:text-[46px] font-light leading-none tracking-[-0.03em] text-[#0B1F5C] dark:text-[#FF8A00] tabular-nums">
                      <CountUp target={10} suffix="+" />
                    </div>
                    <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1.5">
                      {t.testimonials.statLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-0.5 text-[#FF8A00]">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 tabular-nums">
                      {t.testimonials.ratingValue} / 5.0
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-black/8 dark:border-white/10">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-3 text-[14.5px] text-[#111111] dark:text-[#F4F5F7]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3.5 pt-5 border-t border-black/8 dark:border-white/10">
                <p className="text-[14px] text-[#111111] dark:text-[#F4F5F7] leading-relaxed">
                  {t.testimonials.bottomPrompt}
                </p>
                <PillButton label={t.testimonials.cta} to="/contact" />
              </div>
            </div>
          </Reveal>

          {/* Middle Card: Compact Portrait Photo with 5-Star Quote */}
          <Reveal delay={0.08} className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-[24px] md:rounded-[28px] min-h-[300px] max-h-[380px] h-full bg-[#0B1F5C]">
              <SafeImage
                src={SITE_MEDIA.testimonialFeaturedPortrait}
                alt={t.testimonials.featuredAuthor}
                width={520}
                height={560}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white space-y-2.5">
                <div className="flex items-center gap-1 text-[#FF8A00]" aria-label="5 out of 5 stars">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-[15px] font-normal leading-relaxed">
                  {t.testimonials.featuredQuote}
                </p>
                <p className="text-[13px] text-[#FF8A00] font-medium">
                  {t.testimonials.featuredAuthor}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Continuous Vertical Auto-Scrolling Starred Reviews */}
          <Reveal delay={0.16} className="lg:col-span-4">
            <div className="relative h-[340px] lg:h-[380px] overflow-hidden mask-fade-y">
              <div className="animate-vertical-loop space-y-3.5">
                {loopedReviews.map((review, index) => (
                  <article
                    key={`${review.id}-${index}`}
                    className="rounded-[20px] bg-white/95 dark:bg-[#141926]/95 p-5 border border-black/5 dark:border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-1 text-[#FF8A00]"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {Array.from({length: review.rating}).map((_, idx) => (
                          <Star key={idx} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[12px] font-semibold text-[#0B1F5C] dark:text-[#FF8A00] tabular-nums">
                        {review.rating}.0
                      </span>
                    </div>
                    <p className="text-[14px] text-[#111111] dark:text-[#F4F5F7] leading-relaxed">
                      {review.quote[lang]}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <SafeImage
                        src={review.avatar}
                        alt={review.name[lang]}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[#111111] dark:text-white truncate">
                          {review.name[lang]}
                        </p>
                        <p className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8] truncate">
                          {review.destinationAndMonth[lang]}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
