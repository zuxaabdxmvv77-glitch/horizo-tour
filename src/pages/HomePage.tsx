import React from 'react';
import {useLanguage} from '../context/LanguageContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {HeroSection} from '../components/home/HeroSection';
import {OurToursCarouselSection} from '../components/home/OurToursCarouselSection';
import {VideoTourSection} from '../components/home/VideoTourSection';
import {PlanWithConfidenceSection} from '../components/home/PlanWithConfidenceSection';
import {TestimonialsSection} from '../components/home/TestimonialsSection';
import {TeamSection} from '../components/home/TeamSection';
import {AgencyInquirySection} from '../components/home/AgencyInquirySection';

export function HomePage() {
  const {t} = useLanguage();
  useDocumentMeta(t.seo.homeTitle, t.seo.homeDescription);

  return (
    <main>
      <HeroSection />
      <OurToursCarouselSection />
      <VideoTourSection />
      <PlanWithConfidenceSection />
      <TestimonialsSection />
      <TeamSection />
      <AgencyInquirySection />
    </main>
  );
}
