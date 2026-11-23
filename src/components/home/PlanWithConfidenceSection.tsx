import React, {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {useInView, useReducedMotion} from 'motion/react';
import {ArrowUpRight, Check} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {SITE_MEDIA} from '../../data/siteConfig';
import {Reveal, SafeImage} from '../MotionPrimitives';
import {PillButton} from '../PillButton';

export function PlanWithConfidenceSection() {
  const {t} = useLanguage();
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(phoneRef, {once: true, amount: 0.35});
  const prefersReduced = useReducedMotion();
  const [step, setStep] = useState(prefersReduced ? 4 : 0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) {
      setStep(4);
      return;
    }

    const timers = [
      window.setTimeout(() => setStep(1), 200),
      window.setTimeout(() => setStep(2), 900),
      window.setTimeout(() => setStep(3), 1650), // typing indicator
      window.setTimeout(() => setStep(4), 2450),
    ];

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, prefersReduced]);

  const checklist = [t.plan.check1, t.plan.check2, t.plan.check3];

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-10 md:py-14">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Heading */}
        <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-5 sm:p-7 border border-black/5 dark:border-white/10 space-y-2.5">
          <Reveal>
            <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">{t.plan.label}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
              {t.plan.heading}
            </h2>
          </Reveal>
        </div>

        {/* Compact Two-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Compact Image Card -> /gallery */}
          <Reveal className="lg:col-span-5">
            <Link
              to="/gallery"
              className="group relative block overflow-hidden rounded-[24px] md:rounded-[28px] h-[250px] sm:h-[300px] lg:h-full lg:min-h-[340px] bg-white"
            >
              <SafeImage
                src={SITE_MEDIA.planLeftPhoto}
                alt={t.plan.leftCaption}
                width={640}
                height={520}
                className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4 text-white">
                <p className="text-[16px] sm:text-[18px] font-normal leading-snug max-w-xs">
                  {t.plan.leftCaption}
                </p>
                <span
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full bg-white text-[#0B1F5C] flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#FF8A00] group-hover:text-white"
                >
                  <ArrowUpRight className="w-[17px] h-[17px] transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Right: Card with Compact Chat Mockup + Checklist + CTA */}
          <Reveal delay={0.12} className="lg:col-span-7">
            <div className="rounded-[24px] md:rounded-[28px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-7 h-full flex flex-col justify-between gap-6 border border-black/5 dark:border-white/10">
              {/* Compact Phone Chat Mockup */}
              <div ref={phoneRef} className="flex justify-center">
                <div className="w-full max-w-[360px] rounded-[28px] bg-[#111111] dark:bg-[#05070D] p-2 shadow-lg border border-transparent dark:border-white/10">
                  <div className="rounded-[22px] bg-[#F6F5F2] dark:bg-[#0F1422] overflow-hidden">
                    {/* Chat Header */}
                    <div className="bg-[#0B1F5C] text-white px-4 py-2.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#FF8A00] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                        HT
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium leading-tight truncate">
                          {t.plan.chatContactName}
                        </p>
                        <p className="text-[10.5px] text-white/70">{t.plan.chatStatus}</p>
                      </div>
                    </div>

                    {/* Animated Chat Messages */}
                    <div className="p-3.5 space-y-2.5 min-h-[170px] flex flex-col justify-end text-[12.5px] leading-snug">
                      {/* Bubble 1 (incoming) */}
                      <div
                        className={`max-w-[85%] rounded-2xl rounded-tl-sm bg-white dark:bg-[#1B2234] px-3.5 py-2.5 text-[#111111] dark:text-[#F4F5F7] shadow-xs transition-all duration-500 ${
                          step >= 1
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-3 pointer-events-none'
                        }`}
                      >
                        {t.plan.chatBubble1}
                      </div>

                      {/* Reply (outgoing) */}
                      <div
                        className={`self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0B1F5C] dark:bg-[#FF8A00] px-3.5 py-2.5 text-white shadow-xs transition-all duration-500 ${
                          step >= 2
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-3 pointer-events-none'
                        }`}
                      >
                        {t.plan.chatReply}
                      </div>

                      {/* Typing indicator */}
                      {step === 3 && (
                        <div className="self-start inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white dark:bg-[#1B2234] px-3.5 py-2.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B1F5C] dark:bg-white typing-dot-1" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B1F5C] dark:bg-white typing-dot-2" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B1F5C] dark:bg-white typing-dot-3" />
                        </div>
                      )}

                      {/* Bubble 2 (incoming) */}
                      <div
                        className={`max-w-[88%] rounded-2xl rounded-tl-sm bg-white dark:bg-[#1B2234] px-3.5 py-2.5 text-[#111111] dark:text-[#F4F5F7] shadow-xs transition-all duration-500 ${
                          step >= 4
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-3 pointer-events-none h-0 overflow-hidden py-0'
                        }`}
                      >
                        {t.plan.chatBubble2}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Check Items + CTA */}
              <div className="space-y-6">
                <ul className="space-y-3">
                  {checklist.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[15px] text-[#111111] dark:text-[#F4F5F7]"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  <PillButton label={t.plan.cta} to="/tours" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
