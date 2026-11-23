import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {ArrowLeft, Building2, Car, CheckCircle2, Plane, ShieldCheck} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {SITE_CONTACT} from '../data/siteConfig';
import {getTourBySlug, TOURS} from '../data/tours';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal, SafeImage} from '../components/MotionPrimitives';
import {PillButton} from '../components/PillButton';
import {TourCard} from '../components/TourCard';
import {BookingModal} from '../components/BookingModal';

const INCLUSION_ICONS = {
  flight: Plane,
  hotel: Building2,
  transfer: Car,
  insurance: ShieldCheck,
};

export function TourDetailPage() {
  const {slug} = useParams();
  const {lang, t, formatPrice} = useLanguage();
  const tour = getTourBySlug(slug);
  const [bookingOpen, setBookingOpen] = useState(false);

  useDocumentMeta(
    tour ? `${tour.name[lang]} — Horizo Tour` : t.tourDetail.notFound,
    tour ? tour.description[lang] : t.seo.homeDescription
  );

  if (!tour) {
    return (
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto rounded-[28px] bg-white dark:bg-[#141926] p-10 sm:p-16 text-center space-y-6 border border-black/5 dark:border-white/10">
          <h1 className="text-3xl font-light text-[#111111] dark:text-white">
            {t.tourDetail.notFound}
          </h1>
          <PillButton label={t.tourDetail.backToTours} to="/tours" />
        </div>
      </main>
    );
  }

  const otherTours = TOURS.filter((item) => item.slug !== tour.slug).slice(0, 4);

  return (
    <main className="pt-24 md:pt-32 pb-16">
      <article className="px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto space-y-10">
          {/* Back link */}
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 rounded-full bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 border border-black/5 dark:border-white/10 px-4 py-2 text-[14px] font-medium text-[#111111] dark:text-[#F4F5F7] hover:text-[#0B1F5C] dark:hover:text-[#FF8A00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.tourDetail.backToTours}</span>
          </Link>

          {/* Big Hero Image */}
          <Reveal>
            <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] aspect-[16/10] lg:aspect-[21/9] bg-[#0B1F5C]">
              <SafeImage
                src={tour.image}
                alt={tour.name[lang]}
                loading="eager"
                width={1600}
                height={720}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white space-y-2">
                <p className="text-[13px] font-medium text-[#FF8A00]">{tour.country[lang]}</p>
                <h1 className="text-[clamp(2rem,4.5vw,4rem)] font-light leading-[1.06] tracking-[-0.03em]">
                  {tour.name[lang]}
                </h1>
              </div>
            </div>
          </Reveal>

          {/* Main 2-Column Content + Sticky Booking Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Details */}
            <div className="lg:col-span-8 space-y-10">
              <Reveal>
                <div className="rounded-[24px] md:rounded-[28px] bg-white dark:bg-[#141926] p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/8 dark:border-white/10">
                    <div>
                      <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                        {tour.country[lang]}
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-light text-[#111111] dark:text-white">
                        {tour.name[lang]}
                      </h2>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[12px] text-[#5A5A56] dark:text-[#A1A7B8]">
                        {t.tourDetail.startingFrom}
                      </p>
                      <p className="text-2xl font-medium text-[#0B1F5C] dark:text-[#FF8A00] tabular-nums">
                        {formatPrice(tour.priceUsd)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[16px] text-[#111111]/85 dark:text-[#F4F5F7]/85 leading-relaxed">
                    {tour.description[lang]}
                  </p>
                </div>
              </Reveal>

              {/* What's Included (4 items) */}
              <Reveal delay={0.08}>
                <div className="rounded-[24px] md:rounded-[28px] bg-white dark:bg-[#141926] p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-6">
                  <h2 className="text-2xl font-light text-[#111111] dark:text-white">
                    {t.tourDetail.includedTitle}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tour.inclusions.map((inc) => {
                      const Icon = INCLUSION_ICONS[inc.id] || CheckCircle2;
                      return (
                        <div
                          key={inc.id}
                          className="flex items-center gap-4 rounded-[18px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-4 border border-transparent dark:border-white/6"
                        >
                          <span className="w-11 h-11 rounded-full bg-white dark:bg-[#141926] text-[#0B1F5C] dark:text-white flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-[#FF8A00]" />
                          </span>
                          <div>
                            <p className="text-[15px] font-medium text-[#111111] dark:text-white">
                              {inc.label[lang]}
                            </p>
                            <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                              {inc.note[lang]}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Reveal>

              {/* Mini Gallery of 3 Images */}
              <Reveal delay={0.12}>
                <div className="space-y-4">
                  <h2 className="text-2xl font-light text-[#111111] dark:text-white">
                    {t.tourDetail.galleryTitle}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {tour.gallery.map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className="overflow-hidden rounded-[20px] aspect-[4/3] bg-white dark:bg-[#141926]"
                      >
                        <SafeImage
                          src={img}
                          alt={`${tour.name[lang]} ${idx + 1}`}
                          width={560}
                          height={420}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Sticky Booking Card */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <Reveal delay={0.1}>
                <div className="rounded-[24px] md:rounded-[28px] bg-white dark:bg-[#141926] p-6 sm:p-8 border border-black/8 dark:border-white/10 space-y-6 shadow-sm">
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium text-[#FF8A00]">
                      {tour.country[lang]}
                    </p>
                    <h2 className="text-2xl font-light text-[#111111] dark:text-white">
                      {t.tourDetail.bookingCardTitle}
                    </h2>
                    <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                      {t.tourDetail.bookingCardSubtitle}
                    </p>
                  </div>

                  <div className="rounded-[18px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-4 flex items-center justify-between">
                    <span className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">
                      {t.tourDetail.startingFrom}
                    </span>
                    <span className="text-xl font-semibold text-[#0B1F5C] dark:text-[#FF8A00] tabular-nums">
                      {formatPrice(tour.priceUsd)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <PillButton
                      label={t.tourDetail.telegramBook}
                      onClick={() => setBookingOpen(true)}
                      variant="navy"
                      className="w-full justify-between"
                    />
                    <PillButton
                      label={t.tourDetail.callBook}
                      href={SITE_CONTACT.phoneHref}
                      variant="outline"
                      className="w-full justify-between"
                    />
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>

          {/* Other Destinations Row */}
          <div className="pt-8 space-y-8">
            <div className="rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 px-6 py-5 sm:px-8 border border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[clamp(1.65rem,2.8vw,2.5rem)] font-light text-[#111111] dark:text-white">
                {t.tourDetail.otherDestinations}
              </h2>
              <PillButton label={t.toursSection.allToursCta} to="/tours" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {otherTours.map((item) => (
                <TourCard key={item.slug} tour={item} />
              ))}
            </div>
          </div>
        </div>
      </article>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        defaultDestinationSlug={tour.slug}
      />
    </main>
  );
}
