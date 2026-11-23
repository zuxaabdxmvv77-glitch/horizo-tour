import React, {useState} from 'react';
import {ArrowUpRight, Plus} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {FAQ_ITEMS} from '../../data/faq';
import {SITE_MEDIA} from '../../data/siteConfig';
import {Reveal, SafeImage} from '../MotionPrimitives';
import {BookingModal} from '../BookingModal';

export function FaqSection() {
  const {lang, t} = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Heading */}
        <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-3">
          <Reveal>
            <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
              {t.faq.label}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-[clamp(1.85rem,3.4vw,3.1rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
              {t.faq.heading}
            </h2>
          </Reveal>
        </div>

        {/* Left Image Card + Right Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Side Image Card -> Opens Inquiry Modal */}
          <Reveal className="lg:col-span-5">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="group relative block w-full text-left overflow-hidden rounded-[24px] md:rounded-[30px] min-h-[360px] h-full bg-[#0B1F5C] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
            >
              <SafeImage
                src={SITE_MEDIA.faqSidePhoto}
                alt="Horizo Tour Telegram"
                width={640}
                height={800}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex items-end justify-between gap-4 text-white">
                <p className="text-[16px] sm:text-[18px] font-normal leading-snug max-w-xs">
                  {t.faq.sideCardText}
                </p>
                <span
                  aria-hidden="true"
                  className="w-11 h-11 rounded-full bg-white text-[#0B1F5C] flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-[#FF8A00] group-hover:text-white"
                >
                  <ArrowUpRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </div>
            </button>
          </Reveal>

          {/* Right Accordion */}
          <div className="lg:col-span-7 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <Reveal key={item.id} delay={idx * 0.05}>
                  <div className="rounded-[20px] md:rounded-[24px] bg-white dark:bg-[#141926] border border-black/5 dark:border-white/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-6 py-5 min-h-[64px] flex items-center justify-between gap-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
                    >
                      <span className="text-[16px] sm:text-[18px] font-normal text-[#111111] dark:text-white leading-snug">
                        {item.question[lang]}
                      </span>
                      <span
                        className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white rotate-45'
                            : 'bg-[#F6F5F2] dark:bg-white/10 text-[#0B1F5C] dark:text-white'
                        }`}
                        aria-hidden="true"
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-6 pt-0 text-[15px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                          {item.answer[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
