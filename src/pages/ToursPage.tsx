import React, {useEffect, useMemo, useState} from 'react';
import {Compass, Plane, Search} from 'lucide-react';
import {useSearchParams} from 'react-router-dom';
import {useLanguage} from '../context/LanguageContext';
import {TOURS} from '../data/tours';
import {TICKET_TRANSLATIONS} from '../i18n/ticketTranslations';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal} from '../components/MotionPrimitives';
import {TourCard} from '../components/TourCard';
import {FlightTicketBooking} from '../components/FlightTicketBooking';
import {FinalCtaSection} from '../components/home/FinalCtaSection';

type ToursTab = 'tours' | 'tickets';

export function ToursPage() {
  const {lang, t} = useLanguage();
  const tt = TICKET_TRANSLATIONS[lang] ?? TICKET_TRANSLATIONS.uz;
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const initialTab: ToursTab = searchParams.get('tab') === 'tickets' ? 'tickets' : 'tours';
  const [activeTab, setActiveTab] = useState<ToursTab>(initialTab);
  const destParam = searchParams.get('dest') ?? undefined;

  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab === 'tickets') {
      setActiveTab('tickets');
    } else if (paramTab === 'tours') {
      setActiveTab('tours');
    }
  }, [searchParams]);

  const handleTabChange = (nextTab: ToursTab) => {
    setActiveTab(nextTab);
    const nextParams = new URLSearchParams(searchParams);
    if (nextTab === 'tickets') {
      nextParams.set('tab', 'tickets');
    } else {
      nextParams.delete('tab');
      nextParams.delete('dest');
    }
    setSearchParams(nextParams, {replace: true});
  };

  useDocumentMeta(t.seo.toursTitle, t.toursPage.subtitle);

  const filteredTours = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOURS;
    return TOURS.filter(
      (tour) =>
        tour.name[lang].toLowerCase().includes(q) ||
        tour.country[lang].toLowerCase().includes(q),
    );
  }, [query, lang]);

  return (
    <main className="pt-28 md:pt-36">
      <section className="px-4 sm:px-6 lg:px-10 pb-12 md:pb-16">
        <div className="max-w-[1440px] mx-auto space-y-8">
          <div className="print:hidden rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <Reveal>
                <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                  {t.toursSection.label}
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#111111] dark:text-white">
                  {t.toursPage.title}
                </h1>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                  {t.toursPage.subtitle}
                </p>
              </Reveal>

              {/* Mode Switcher: Tur paketlar / Onlayn Aviabiletlar */}
              <div className="pt-1 inline-flex flex-wrap items-center gap-1.5 rounded-full bg-white dark:bg-[#141926] p-1.5 border border-black/8 dark:border-white/12 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleTabChange('tours')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2.5 min-h-[42px] text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${
                    activeTab === 'tours'
                      ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                      : 'text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>{tt.tabTours}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('tickets')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2.5 min-h-[42px] text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${
                    activeTab === 'tickets'
                      ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                      : 'text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  <span>{tt.tabFlights}</span>
                </button>
              </div>
            </div>

            {/* Search Input (shown in Tours view) */}
            {activeTab === 'tours' && (
              <Reveal delay={0.16} className="w-full lg:w-80">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#5A5A56] dark:text-[#A1A7B8] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.toursPage.searchPlaceholder}
                    aria-label={t.toursPage.searchPlaceholder}
                    className="w-full rounded-full bg-white dark:bg-[#141926] border border-black/10 dark:border-white/15 ps-11 pe-4 py-3 min-h-[44px] text-[14px] text-[#111111] dark:text-white placeholder:text-[#5A5A56]/70 dark:placeholder:text-[#A1A7B8]/70 focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
                  />
                </div>
              </Reveal>
            )}
          </div>

          {activeTab === 'tickets' ? (
            <FlightTicketBooking initialDestinationSlug={destParam} />
          ) : filteredTours.length === 0 ? (
            <div className="rounded-[24px] bg-white dark:bg-[#141926] p-12 text-center text-[#5A5A56] dark:text-[#A1A7B8] border border-black/5 dark:border-white/10">
              {t.toursPage.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTours.map((tour, index) => (
                <Reveal key={tour.slug} delay={Math.min(index * 0.05, 0.3)}>
                  <TourCard tour={tour} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="print:hidden">
        <FinalCtaSection />
      </div>
    </main>
  );
}
