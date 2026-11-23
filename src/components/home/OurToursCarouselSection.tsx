import React, {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {TOURS} from '../../data/tours';
import {useLanguage} from '../../context/LanguageContext';
import {Reveal} from '../MotionPrimitives';
import {PillButton} from '../PillButton';
import {TourCard} from '../TourCard';

export function OurToursCarouselSection() {
  const {t} = useLanguage();
  const prefersReduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const didDrag = useRef(false);

  // Duplicate list for seamless infinite loop
  const loopedTours = [...TOURS, ...TOURS];

  useEffect(() => {
    if (prefersReduced) return;
    const container = trackRef.current;
    if (!container) return;

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(48, now - lastTime);
      lastTime = now;

      if (!isPaused && !isDragging.current && container) {
        container.scrollLeft += dt * 0.045;
        const halfWidth = container.scrollWidth / 2;
        if (halfWidth > 0 && container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused, prefersReduced]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = trackRef.current;
    if (!container) return;
    isDragging.current = true;
    didDrag.current = false;
    startX.current = e.pageX;
    scrollLeftStart.current = container.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 6) {
      didDrag.current = true;
    }
    trackRef.current.scrollLeft = scrollLeftStart.current - dx;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  };

  return (
    <section className="py-10 md:py-14 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mb-7 md:mb-9">
        <div className="rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-5 sm:p-7 border border-black/5 dark:border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Reveal>
              <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.toursSection.label}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-[clamp(1.85rem,3.4vw,3.1rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
                {t.toursSection.heading}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <PillButton label={t.toursSection.allToursCta} to="/tours" />
          </Reveal>
        </div>
      </div>

      {/* Horizontal Carousel (LTR track keeps infinite loop scroll identical in RTL languages) */}
      <div
        ref={trackRef}
        dir="ltr"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          isDragging.current = false;
        }}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        className="flex gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-2 cursor-grab active:cursor-grabbing no-scrollbar"
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
      >
        {loopedTours.map((tour, index) => (
          <div
            key={`${tour.slug}-${index}`}
            className="shrink-0 w-[80vw] sm:w-[320px] md:w-[350px] lg:w-[370px]"
          >
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </section>
  );
}
