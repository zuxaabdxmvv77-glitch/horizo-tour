import React, {useEffect, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {Award, Expand, Headphones, Instagram, Send, ShieldCheck, Users, X} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {SITE_CONTACT, SITE_MEDIA} from '../../data/siteConfig';
import {FOUNDER, TEAM_MEMBERS} from '../../data/team';
import {Reveal, SafeImage} from '../MotionPrimitives';

interface TeamSectionProps {
  showGroupIntro?: boolean;
}

export function TeamSection({showGroupIntro = true}: TeamSectionProps) {
  const {lang, t} = useLanguage();
  const prefersReduced = useReducedMotion();
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewerOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [viewerOpen]);

  const badges = [
    {icon: Award, label: t.teamSection.badge1},
    {icon: ShieldCheck, label: t.teamSection.badge2},
    {icon: Headphones, label: t.teamSection.badge3},
    {icon: Users, label: t.teamSection.badge4},
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-10 md:py-14">
      <div className="max-w-[1440px] mx-auto space-y-10 md:space-y-12">
        {showGroupIntro && (
          <div className="space-y-6">
            {/* Row of 4 small trust badges with icons */}
            <Reveal>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.label}
                      className="inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-[#141926]/95 px-4 py-2 text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7] border border-black/6 dark:border-white/10"
                    >
                      <Icon className="w-4 h-4 text-[#FF8A00] shrink-0" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            {/* Group Photo + Intro Card (compact height) */}
            <Reveal delay={0.08}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-[24px] md:rounded-[28px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-6 border border-black/5 dark:border-white/10 items-center">
                <div className="lg:col-span-5 overflow-hidden rounded-[18px] md:rounded-[22px] aspect-[16/10] max-h-[250px] bg-[#0B1F5C]">
                  <SafeImage
                    src={SITE_MEDIA.teamGroupPhoto}
                    alt={t.teamSection.groupTitle}
                    width={720}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:col-span-7 lg:px-4 space-y-4">
                  <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                    {t.teamSection.label}
                  </p>
                  <h3 className="text-[clamp(1.5rem,2.4vw,2.15rem)] font-light leading-[1.16] tracking-[-0.03em] text-[#111111] dark:text-white">
                    {t.teamSection.groupTitle}
                  </h3>
                  <p className="text-[14.5px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed max-w-lg">
                    {t.teamSection.groupText}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={SITE_CONTACT.telegramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Telegram"
                      className="inline-flex items-center gap-2 rounded-full bg-[#0B1F5C] dark:bg-white text-white dark:text-[#0B1F5C] px-4 py-2.5 min-h-[44px] text-[13px] font-medium hover:bg-[#FF8A00] dark:hover:bg-[#FF8A00] dark:hover:text-white transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Telegram</span>
                    </a>
                    <a
                      href={SITE_CONTACT.instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="inline-flex items-center gap-2 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#111111] dark:text-white px-4 py-2.5 min-h-[44px] text-[13px] font-medium hover:bg-[#FF8A00] hover:text-white transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        )}

        {/* Heading: Meet our team */}
        <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-5 sm:p-7 border border-black/5 dark:border-white/10 space-y-2.5">
          <Reveal>
            <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
              {t.teamSection.label}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
              {t.teamSection.heading}
            </h2>
          </Reveal>
        </div>

        {/* Founder Spotlight Card (compact portrait) */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-[24px] md:rounded-[28px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-6 border border-black/5 dark:border-white/10 items-center">
            <motion.button
              type="button"
              onClick={() => setViewerOpen(true)}
              aria-label={FOUNDER.name}
              initial={prefersReduced ? false : {opacity: 0, scale: 0.94}}
              whileInView={{opacity: 1, scale: 1}}
              viewport={{once: true, amount: 0.25}}
              transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
              whileHover={prefersReduced ? undefined : {y: -3}}
              whileTap={prefersReduced ? undefined : {scale: 0.985}}
              className="group relative lg:col-span-4 overflow-hidden rounded-[20px] aspect-[4/5] max-h-[300px] w-full bg-[#0B1F5C] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] shadow-[0_14px_34px_rgba(11,31,92,0.16)]"
            >
              <motion.div
                className="w-full h-full"
                animate={
                  prefersReduced
                    ? undefined
                    : {
                        scale: [1, 1.045, 1],
                        y: [0, -5, 0],
                      }
                }
                transition={
                  prefersReduced
                    ? undefined
                    : {
                        duration: 9,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
              >
                <SafeImage
                  src={FOUNDER.image}
                  alt={FOUNDER.name}
                  width={600}
                  height={800}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
              </motion.div>

              {/* Soft gradient + animated glass expand pill */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="rounded-full bg-white/18 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-white text-[12px] font-medium">
                  {t.teamSection.founderAttribution}
                </div>
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:bg-[#FF8A00] group-hover:border-[#FF8A00] transition-colors duration-300">
                  <Expand className="w-4 h-4" />
                </span>
              </div>
            </motion.button>

            <div className="lg:col-span-8 lg:px-6 space-y-4">
              <span className="inline-block rounded-full bg-[#FF8A00]/12 text-[#FF8A00] px-3.5 py-1 text-[12px] font-semibold">
                {t.teamSection.founderBadge}
              </span>
              <blockquote className="text-[clamp(1.35rem,2.2vw,1.95rem)] font-light leading-[1.24] tracking-[-0.02em] text-[#111111] dark:text-white">
                “{t.teamSection.founderQuote}”
              </blockquote>
              <p className="text-[15px] font-medium text-[#0B1F5C] dark:text-[#FF8A00]">
                — {t.teamSection.founderAttribution}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Team Member Cards Grid (5 staff members) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {TEAM_MEMBERS.map((member, index) => (
            <Reveal key={member.id} delay={index * 0.08}>
              <div className="group rounded-[22px] bg-white/95 dark:bg-[#141926]/95 p-3 border border-black/5 dark:border-white/10 transition-transform duration-300 hover:-translate-y-1">
                <div className="overflow-hidden rounded-[18px] aspect-square bg-[#F6F5F2] dark:bg-[#0B0E17] mb-3.5">
                  <SafeImage
                    src={member.image}
                    alt={`${member.name} — ${member.role[lang]}`}
                    width={440}
                    height={440}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="px-1 pb-1">
                  <h3 className="text-[17px] font-medium text-[#111111] dark:text-white tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8] mt-0.5">
                    {member.role[lang]}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Interactive Media Viewer Modal for Founder Portrait */}
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.22}}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={FOUNDER.name}
            onClick={() => setViewerOpen(false)}
          >
            <motion.div
              initial={prefersReduced ? {opacity: 0} : {opacity: 0, scale: 0.88, y: 18}}
              animate={{opacity: 1, scale: 1, y: 0}}
              exit={prefersReduced ? {opacity: 0} : {opacity: 0, scale: 0.92, y: 12}}
              transition={{type: 'spring', stiffness: 320, damping: 28}}
              className="relative max-w-md w-full rounded-[28px] overflow-hidden bg-[#141926] border border-white/15 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setViewerOpen(false)}
                aria-label={t.common.close}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-[#FF8A00] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-[3/4] w-full overflow-hidden">
                <SafeImage
                  src={FOUNDER.image}
                  alt={FOUNDER.name}
                  width={600}
                  height={800}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-5 bg-[#0B1F5C] text-white space-y-1.5">
                <p className="text-[12px] uppercase tracking-wider text-[#FF8A00] font-semibold">
                  {t.teamSection.founderBadge}
                </p>
                <p className="text-lg font-medium">{FOUNDER.name}</p>
                <p className="text-[14px] text-white/80 leading-relaxed">
                  “{t.teamSection.founderQuote}”
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
