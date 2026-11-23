import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {motion, useReducedMotion} from 'motion/react';
import {ArrowUpRight, Headphones, MapPin, Plane, ShieldCheck} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {BookingModal} from '../BookingModal';

export function HeroSection() {
  const {t} = useLanguage();
  const prefersReduced = useReducedMotion();
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <section className="px-3 sm:px-6 lg:px-10 pt-3">
        <div className="max-w-[1440px] mx-auto relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-[#0B1F5C]/14 dark:bg-[#070B16]/18 border border-white/25 dark:border-white/12 min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] flex flex-col justify-end shadow-[0_24px_60px_rgba(11,31,92,0.16)]">
          {/* Lightened Gradient Frame Letting 4K 3D Globe & Commercial Airliner Shine Through */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050D28]/78 via-[#071540]/18 to-[#071540]/28" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050D28]/60 via-[#050D28]/14 to-transparent" />
          </div>

          {/* Hero Foreground Content */}
          <div className="relative z-10 px-5 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-9 pt-24 sm:pt-28 flex flex-col justify-end gap-5 sm:gap-6">
            {/* Top-aligned bottom row: Huge Headline Left + Short Paragraph Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-end">
              <div className="lg:col-span-7">
                <h1 className="text-[clamp(2.1rem,4.8vw,4.5rem)] font-light text-white leading-[1.05] tracking-[-0.03em] drop-shadow-[0_4px_24px_rgba(5,13,40,0.55)]">
                  <span className="block overflow-hidden">
                    <motion.span
                      className="block"
                      initial={prefersReduced ? false : {y: '100%', opacity: 0}}
                      animate={{y: 0, opacity: 1}}
                      transition={{duration: 0.85, ease: [0.22, 1, 0.36, 1]}}
                    >
                      {t.hero.line1}
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden">
                    <motion.span
                      className="block"
                      initial={prefersReduced ? false : {y: '100%', opacity: 0}}
                      animate={{y: 0, opacity: 1}}
                      transition={{duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1]}}
                    >
                      {t.hero.line2}
                    </motion.span>
                  </span>
                </h1>
              </div>

              <motion.div
                className="lg:col-span-5 lg:pb-1"
                initial={prefersReduced ? false : {opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1]}}
              >
                <p className="text-[15px] sm:text-[16px] text-white/95 font-normal leading-relaxed max-w-md lg:ml-auto drop-shadow-[0_2px_14px_rgba(5,13,40,0.65)]">
                  {t.hero.subtitle}
                </p>
              </motion.div>
            </div>

            {/* Bottom Interactive Glass Buttons Row */}
            <motion.div
              initial={prefersReduced ? false : {opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.75, delay: 0.34, ease: [0.22, 1, 0.36, 1]}}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/20"
            >
              {/* Bottom-left interactive glass pill button */}
              <Link
                to="/tours"
                className="group inline-flex items-center gap-2.5 self-start rounded-full bg-[#0B1F5C]/55 hover:bg-[#0B1F5C]/80 border border-white/35 hover:border-[#FF8A00]/80 px-3.5 py-2 min-h-[44px] text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
              >
                <div className="flex -space-x-2" aria-hidden="true">
                  <span className="w-6 h-6 rounded-full bg-[#0B1F5C] border border-white/60 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-[#FF8A00]" />
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#FF8A00] border border-white/60 flex items-center justify-center">
                    <Plane className="w-3 h-3 text-white" />
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#0B1F5C] border border-white/60 text-[10px] font-semibold flex items-center justify-center">
                    11
                  </span>
                </div>
                <span className="text-[13px] font-medium whitespace-nowrap">
                  {t.hero.destinationsChip}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:text-[#FF8A00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              {/* Bottom-right three interactive glass buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/tours"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0B1F5C]/55 hover:bg-[#0B1F5C]/80 border border-white/35 hover:border-[#FF8A00]/80 px-4 py-2 min-h-[44px] text-white text-[13px] font-medium whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
                >
                  <Plane className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                  <span>{t.hero.chipFlights}</span>
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0B1F5C]/55 hover:bg-[#0B1F5C]/80 border border-white/35 hover:border-[#FF8A00]/80 px-4 py-2 min-h-[44px] text-white text-[13px] font-medium whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                  <span>{t.hero.chipService}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF8A00]/90 hover:bg-[#FF8A00] border border-white/35 hover:border-white px-4 py-2 min-h-[44px] text-white text-[13px] font-medium whitespace-nowrap shadow-[0_8px_20px_rgba(255,138,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Headphones className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{t.hero.chipSupport}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
