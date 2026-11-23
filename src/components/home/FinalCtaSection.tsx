import React, {useState} from 'react';
import {useLanguage} from '../../context/LanguageContext';
import {SITE_CONTACT, SITE_MEDIA} from '../../data/siteConfig';
import {Reveal, SafeImage} from '../MotionPrimitives';
import {PillButton} from '../PillButton';
import {BookingModal} from '../BookingModal';

export function FinalCtaSection() {
  const {t} = useLanguage();
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto">
        <Reveal>
          <div className="rounded-[28px] md:rounded-[36px] bg-white dark:bg-[#141926] p-6 sm:p-10 lg:p-14 border border-black/5 dark:border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Copy + Two Buttons */}
              <div className="lg:col-span-6 space-y-6">
                <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                  {t.finalCta.label}
                </p>
                <h2 className="text-[clamp(1.9rem,3.6vw,3.3rem)] font-light leading-[1.1] tracking-[-0.03em] text-[#111111] dark:text-white">
                  {t.finalCta.heading}
                </h2>
                <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] max-w-md leading-relaxed">
                  {t.finalCta.text}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <PillButton
                    label={t.finalCta.telegramBtn}
                    onClick={() => setBookingOpen(true)}
                    variant="navy"
                  />
                  <PillButton
                    label={t.finalCta.callBtn}
                    href={SITE_CONTACT.phoneHref}
                    variant="outline"
                  />
                </div>
              </div>

              {/* Right Two Overlapping Rounded Images */}
              <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-[500px] h-[340px] sm:h-[400px]">
                  <div className="absolute left-0 top-0 w-[62%] h-[78%] overflow-hidden rounded-[24px] shadow-md bg-[#0B1F5C]">
                    <SafeImage
                      src={SITE_MEDIA.finalCtaPhotos[0]}
                      alt="Dubai"
                      width={520}
                      height={650}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute right-0 bottom-0 w-[56%] h-[76%] overflow-hidden rounded-[24px] border-4 border-white dark:border-[#141926] shadow-xl bg-[#0B1F5C]">
                    <SafeImage
                      src={SITE_MEDIA.finalCtaPhotos[1]}
                      alt="Korea"
                      width={480}
                      height={600}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
