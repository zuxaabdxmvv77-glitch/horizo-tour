import React, {useRef} from 'react';
import {motion, useReducedMotion, useScroll, useTransform} from 'motion/react';
import {useLanguage} from '../../context/LanguageContext';
import {SITE_MEDIA} from '../../data/siteConfig';
import {Reveal, SafeImage} from '../MotionPrimitives';
import {PillButton} from '../PillButton';

export function ExperienceRowSection() {
  const {t} = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();

  const {scrollYProgress} = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const yOffsetSlow = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const yOffsetFast = useTransform(scrollYProgress, [0, 1], [-18, 28]);

  return (
    <section ref={sectionRef} className="px-4 sm:px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto space-y-12 md:space-y-14">
        {/* Top Heading */}
        <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-4">
          <Reveal>
            <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
              {t.experience.label}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-[clamp(1.85rem,3.4vw,3.1rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
              {t.experience.heading}
            </h2>
          </Reveal>
        </div>

        {/* Three Rounded Images in One Row (varied proportions + subtle parallax) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <Reveal className="md:col-span-4">
            <motion.div
              style={prefersReduced ? undefined : {y: yOffsetSlow}}
              className="overflow-hidden rounded-[24px] md:rounded-[28px] aspect-[4/5] bg-white"
            >
              <SafeImage
                src={SITE_MEDIA.experiencePhotos[0]}
                alt="Phuket"
                width={640}
                height={800}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-4">
            <motion.div
              style={prefersReduced ? undefined : {y: yOffsetFast}}
              className="overflow-hidden rounded-[24px] md:rounded-[28px] aspect-[4/3] md:aspect-square bg-white"
            >
              <SafeImage
                src={SITE_MEDIA.experiencePhotos[1]}
                alt="Istanbul"
                width={700}
                height={700}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Reveal>

          <Reveal delay={0.18} className="md:col-span-4">
            <motion.div
              style={prefersReduced ? undefined : {y: yOffsetSlow}}
              className="overflow-hidden rounded-[24px] md:rounded-[28px] aspect-[3/4] bg-white"
            >
              <SafeImage
                src={SITE_MEDIA.experiencePhotos[2]}
                alt="Bali"
                width={640}
                height={850}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </Reveal>
        </div>

        {/* Bottom CTA Row */}
        <Reveal delay={0.1}>
          <div className="rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 px-6 py-5 border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <p className="text-[15px] md:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] max-w-xl leading-relaxed">
              {t.experience.bottomText}
            </p>
            <PillButton label={t.experience.cta} to="/gallery" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
