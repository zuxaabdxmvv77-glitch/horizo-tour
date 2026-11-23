import React from 'react';
import {Link} from 'react-router-dom';
import {Instagram, Lock, Mail, Phone, Send} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {SITE_CONTACT, SITE_MEDIA} from '../data/siteConfig';
import {Logo} from './Logo';
import {SafeImage} from './MotionPrimitives';

export function Footer() {
  const {t} = useLanguage();
  const {isOwner} = useAuth();

  return (
    <footer className="px-3 sm:px-6 lg:px-10 pb-6 pt-10 relative z-10">
      <div className="max-w-[1440px] mx-auto relative overflow-hidden rounded-[28px] md:rounded-[36px] bg-[#0B1F5C] text-white shadow-[0_24px_64px_rgba(7,21,66,0.35)]">
        {/* Crisp 4K World-Travel Panoramic Backdrop Image with Balanced Navy Scrim */}
        <div className="absolute inset-0 pointer-events-none">
          <SafeImage
            src={SITE_MEDIA.footerBackdrop}
            alt="Horizo Tour"
            className="w-full h-full object-cover object-center opacity-50"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F5C]/84 via-[#0B1F5C]/58 to-[#071542]/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071542]/75 via-transparent to-[#071542]/70" />
        </div>

        <div className="relative z-10 px-5 sm:px-8 lg:px-12 pt-7 md:pt-9 pb-5">
          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 pb-6 md:pb-8">
            {/* Brand Column */}
            <div className="md:col-span-2 lg:col-span-4 space-y-2.5">
              <Logo variant="light" />
              <p className="text-[14px] md:text-[15px] text-white/90 font-light max-w-xs leading-relaxed drop-shadow-xs">
                {t.brand.tagline}
              </p>
              <p className="text-[12px] text-white/70">{t.brand.location}</p>
            </div>

            {/* Navigation Column (Compact 2-Column Grid) */}
            <div className="lg:col-span-4 space-y-2.5">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-white/65">
                {t.footer.navTitle}
              </h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[14px]">
                {[
                  {to: '/', label: t.nav.home},
                  {to: '/tours', label: t.nav.tours},
                  {to: '/about', label: t.nav.about},
                  {to: '/blog', label: t.nav.blog},
                  {to: '/gallery', label: t.nav.gallery},
                  {to: '/experience', label: t.nav.moreExperience},
                  {to: '/faq', label: t.nav.moreFaq},
                  {to: '/contact', label: t.nav.contact},
                ].map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-white/90 hover:text-[#FF8A00] transition-colors inline-block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-4 space-y-2.5">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-white/65">
                {t.footer.contactTitle}
              </h3>
              <ul className="space-y-2 text-[14px]">
                <li>
                  <a
                    href={SITE_CONTACT.phoneHref}
                    className="inline-flex items-center gap-2 text-white/95 hover:text-[#FF8A00] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                    <span className="tabular-nums">{SITE_CONTACT.phoneDisplay}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONTACT.telegramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/95 hover:text-[#FF8A00] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                    <span>Telegram {SITE_CONTACT.telegramHandle}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONTACT.instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/95 hover:text-[#FF8A00] transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                    <span>Instagram {SITE_CONTACT.instagramHandle}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={SITE_CONTACT.emailHref}
                    className="inline-flex items-center gap-2 text-white/95 hover:text-[#FF8A00] transition-colors break-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                    <span>{SITE_CONTACT.email}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Compact Footer Wordmark */}
          <div className="border-t border-white/15 pt-4 pb-3">
            <div className="text-[clamp(1.75rem,4.5vw,3.5rem)] font-light tracking-[-0.03em] leading-[1.05] text-white/92 select-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.3)]">
              Horizo Tour
            </div>
          </div>

          {/* Bottom Legal Row */}
          <div className="border-t border-white/15 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] sm:text-[13px] text-white/75">
            <p>{t.footer.copyright}</p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <Link to="/privacy" className="hover:text-white transition-colors py-0.5">
                {t.footer.privacy}
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors py-0.5">
                {t.footer.terms}
              </Link>
              {isOwner && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 hover:text-[#FF8A00] transition-colors py-0.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.footer.admin}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
