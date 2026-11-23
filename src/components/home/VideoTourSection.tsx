import React, {useEffect, useState} from 'react';
import {Pause, Play, X} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {SITE_MEDIA} from '../../data/siteConfig';
import {TOURS} from '../../data/tours';
import {CountUp, Reveal, SafeImage} from '../MotionPrimitives';
import {PillButton} from '../PillButton';

/**
 * Paste your YouTube embed URL (e.g. "https://www.youtube.com/embed/VIDEO_ID")
 * or direct MP4 link below when ready. While empty, clicking Play shows an animated
 * multi-destination travel reel placeholder.
 */
const VIDEO_URL = '';

export function VideoTourSection() {
  const {lang, t} = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [reelPlaying, setReelPlaying] = useState(true);

  const showcaseSlides = TOURS.slice(0, 5);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen || !reelPlaying || VIDEO_URL) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % showcaseSlides.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [modalOpen, reelPlaying, showcaseSlides.length]);

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-10 md:py-14">
      <div className="max-w-[1440px] mx-auto">
        <Reveal>
          <div className="rounded-[24px] md:rounded-[30px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-7 lg:p-8 border border-black/5 dark:border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Copy & Compact Stat */}
            <div className="lg:col-span-6 space-y-4">
              <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.video.label}
              </p>
              <h2 className="text-[clamp(1.75rem,3vw,2.65rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
                {t.video.heading}
              </h2>
              <p className="text-[15px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed max-w-lg">
                {t.video.rightText} {t.video.bottomText}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#0B1F5C] dark:bg-white text-white dark:text-[#0B1F5C] hover:bg-[#FF8A00] dark:hover:bg-[#FF8A00] dark:hover:text-white px-5 py-2.5 min-h-[44px] text-[14px] font-medium transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.video.playAria}</span>
                </button>
                <div className="inline-flex items-baseline gap-2 px-3 py-1">
                  <span className="text-2xl font-light text-[#0B1F5C] dark:text-[#FF8A00] tabular-nums">
                    <CountUp target={10} suffix="+" />
                  </span>
                  <span className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                    {t.video.statLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Compact Video Thumbnail Card */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-[20px] md:rounded-[24px] aspect-[16/10] max-h-[300px] w-full bg-[#0B1F5C]">
                <SafeImage
                  src={SITE_MEDIA.heroImage}
                  alt={t.video.heading}
                  width={960}
                  height={600}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20" />

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  aria-label={t.video.playAria}
                  className="group absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-[#0B1F5C] shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-[#FF8A00] hover:text-white hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF8A00]/60"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Video Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.video.modalTitle}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-[24px] md:rounded-[30px] bg-[#0B1F5C] text-white overflow-hidden shadow-2xl border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#FF8A00]">
                  {t.video.modalShowcaseBadge}
                </span>
                <span className="text-sm sm:text-base font-medium">{t.video.modalTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={t.common.close}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FF8A00] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Player Area */}
            {VIDEO_URL ? (
              <div className="aspect-video bg-black">
                <iframe
                  src={VIDEO_URL}
                  title={t.video.modalTitle}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-[#071542] overflow-hidden">
                {showcaseSlides.map((slide, idx) => (
                  <div
                    key={slide.slug}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      idx === slideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <SafeImage
                      src={slide.image}
                      alt={slide.name[lang]}
                      className={`w-full h-full object-cover transition-transform duration-[2600ms] ease-out ${
                        idx === slideIndex && reelPlaying ? 'scale-105' : 'scale-100'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#FF8A00] font-medium mb-1">
                          {slide.country[lang]}
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-light text-white">
                          {slide.name[lang]}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReelPlaying((p) => !p)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2 text-xs font-medium text-white hover:bg-[#FF8A00] transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        {reelPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{slideIndex + 1} / {showcaseSlides.length}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer with URL Config Note */}
            <div className="px-5 sm:px-7 py-4 bg-[#071542] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed max-w-xl">
                {t.video.modalNote}
              </p>
              <div onClick={() => setModalOpen(false)}>
                <PillButton label={t.video.modalCta} to="/contact" variant="white" />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
