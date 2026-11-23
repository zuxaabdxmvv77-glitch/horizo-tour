import React, {useEffect, useMemo, useState} from 'react';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {GALLERY_PHOTOS} from '../data/gallery';
import {TOURS} from '../data/tours';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal, SafeImage} from '../components/MotionPrimitives';
import {FinalCtaSection} from '../components/home/FinalCtaSection';

export function GalleryPage() {
  const {lang, t} = useLanguage();
  const [selectedSlug, setSelectedSlug] = useState<string>('all');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useDocumentMeta(t.seo.galleryTitle, t.galleryPage.subtitle);

  const visiblePhotos = useMemo(() => {
    if (selectedSlug === 'all') return GALLERY_PHOTOS;
    return GALLERY_PHOTOS.filter((p) => p.destinationSlug === selectedSlug);
  }, [selectedSlug]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % visiblePhotos.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + visiblePhotos.length) % visiblePhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, visiblePhotos.length]);

  const activePhoto = lightboxIdx !== null ? visiblePhotos[lightboxIdx] : null;

  return (
    <main className="pt-28 md:pt-36">
      <section className="px-4 sm:px-6 lg:px-10 pb-16">
        <div className="max-w-[1440px] mx-auto space-y-10">
          {/* Header */}
          <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-3">
            <Reveal>
              <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.galleryPage.label}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#111111] dark:text-white">
                {t.galleryPage.title}
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                {t.galleryPage.subtitle}
              </p>
            </Reveal>
          </div>

          {/* Filter Chips */}
          <Reveal delay={0.16}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSlug('all');
                  setLightboxIdx(null);
                }}
                className={`px-4 py-2 min-h-[40px] rounded-full text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedSlug === 'all'
                    ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                    : 'bg-white dark:bg-[#141926] text-[#111111] dark:text-[#F4F5F7] border border-black/10 dark:border-white/15 hover:border-[#0B1F5C] dark:hover:border-white'
                }`}
              >
                {t.galleryPage.allChip}
              </button>

              {TOURS.map((tour) => {
                const active = selectedSlug === tour.slug;
                return (
                  <button
                    key={tour.slug}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(tour.slug);
                      setLightboxIdx(null);
                    }}
                    className={`px-4 py-2 min-h-[40px] rounded-full text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                        : 'bg-white dark:bg-[#141926] text-[#111111] dark:text-[#F4F5F7] border border-black/10 dark:border-white/15 hover:border-[#0B1F5C] dark:hover:border-white'
                    }`}
                  >
                    {tour.name[lang]}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {visiblePhotos.map((photo, index) => (
              <Reveal key={photo.id} delay={Math.min(index * 0.04, 0.25)}>
                <button
                  type="button"
                  onClick={() => setLightboxIdx(index)}
                  className="group relative block w-full overflow-hidden rounded-[24px] bg-white break-inside-avoid cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00]"
                >
                  <SafeImage
                    src={photo.image}
                    alt={photo.caption[lang]}
                    width={800}
                    height={photo.tall ? 1050 : 720}
                    className={`w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] ${
                      photo.tall ? 'aspect-[3/4]' : 'aspect-[4/3]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-85 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[12px] text-[#FF8A00] font-medium">
                      {photo.destinationLabel[lang]}
                    </p>
                    <p className="text-[15px] font-normal mt-0.5">{photo.caption[lang]}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              aria-label={t.galleryPage.lightboxClose}
              className="self-end w-11 h-11 rounded-full bg-white/15 hover:bg-[#FF8A00] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full max-h-[75vh] overflow-hidden rounded-[24px] bg-[#0B1F5C]">
              <SafeImage
                src={activePhoto.image}
                alt={activePhoto.caption[lang]}
                loading="eager"
                className="w-full max-h-[75vh] object-contain mx-auto"
              />
            </div>

            <div className="w-full flex items-center justify-between text-white px-2">
              <div>
                <p className="text-xs text-[#FF8A00] font-medium">
                  {activePhoto.destinationLabel[lang]}
                </p>
                <p className="text-sm sm:text-base">{activePhoto.caption[lang]}</p>
              </div>
              {visiblePhotos.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={t.galleryPage.lightboxPrev}
                    onClick={() =>
                      setLightboxIdx((lightboxIdx - 1 + visiblePhotos.length) % visiblePhotos.length)
                    }
                    className="w-11 h-11 rounded-full bg-white/15 hover:bg-[#FF8A00] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label={t.galleryPage.lightboxNext}
                    onClick={() => setLightboxIdx((lightboxIdx + 1) % visiblePhotos.length)}
                    className="w-11 h-11 rounded-full bg-white/15 hover:bg-[#FF8A00] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <FinalCtaSection />
    </main>
  );
}
