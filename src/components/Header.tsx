import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  FileText,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Menu,
  Moon,
  Phone,
  Send,
  Sun,
  User,
  X,
} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {useTheme} from '../context/ThemeContext';
import {SITE_CONTACT} from '../data/siteConfig';
import {buildTelegramDraftUrl, getLatestTelegramDraft} from '../utils/telegramDraft';
import {Logo} from './Logo';

export function Header() {
  const {user, isOwner, logout} = useAuth();
  const {lang, langMeta, languages, setLang, t} = useLanguage();
  const {theme, toggleTheme} = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setLangMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!moreOpen && !langMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (moreOpen && moreRef.current && !moreRef.current.contains(target)) {
        setMoreOpen(false);
      }
      if (langMenuOpen && langRef.current && !langRef.current.contains(target)) {
        setLangMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen, langMenuOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const transparentOverHero = isHome && !isScrolled && !mobileOpen;
  const isDark = theme === 'dark';

  const navItems = [
    {to: '/', label: t.nav.home},
    {to: '/tours', label: t.nav.tours},
    {to: '/about', label: t.nav.about},
    {to: '/blog', label: t.nav.blog},
    {to: '/gallery', label: t.nav.gallery},
  ];

  const extraPages = [
    {to: '/experience', label: t.nav.moreExperience, icon: Compass},
    {to: '/faq', label: t.nav.moreFaq, icon: HelpCircle},
    {to: '/contact', label: t.nav.contact, icon: Phone},
    {to: '/#inquiry', label: t.nav.moreInquiry, icon: FileText},
    ...(isOwner ? [{to: '/admin', label: t.nav.moreAdmin, icon: Lock}] : []),
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          transparentOverHero
            ? 'px-4 sm:px-6 lg:px-10 pt-2 sm:pt-3'
            : 'px-4 sm:px-7 lg:px-12 pt-3 sm:pt-4'
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto flex items-center justify-between gap-4 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen
              ? 'max-w-[1400px] px-4 sm:px-6 lg:px-7 h-[60px] sm:h-[64px] rounded-full bg-white/10 backdrop-blur-2xl backdrop-saturate-150 border border-white/25 text-white shadow-[0_12px_36px_rgba(0,0,0,0.22)]'
              : transparentOverHero
                ? 'max-w-[1440px] px-2 sm:px-4 h-[64px] sm:h-[68px] rounded-full bg-transparent border border-transparent text-white shadow-none'
                : 'max-w-[1400px] px-4 sm:px-6 lg:px-7 h-[60px] sm:h-[64px] rounded-full bg-white/42 dark:bg-[#141926]/48 backdrop-blur-3xl backdrop-saturate-200 border border-white/65 dark:border-white/15 ring-1 ring-black/5 dark:ring-white/8 text-[#111111] dark:text-white shadow-[0_12px_36px_rgba(11,31,92,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.12)]'
          }`}
        >
          {/* Left: Logo */}
          <Link
            to="/"
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] rounded-full"
          >
            <Logo variant={transparentOverHero || mobileOpen || isDark ? 'light' : 'dark'} />
          </Link>

          {/* Center: Location caption */}
          <div
            className={`hidden xl:block text-[13px] font-normal tracking-normal whitespace-nowrap ${
              transparentOverHero || mobileOpen
                ? 'text-white/85'
                : 'text-[#5A5A56] dark:text-[#A1A7B8]'
            }`}
          >
            {t.brand.location}
          </div>

          {/* Right: Nav links + More Dropdown + Theme toggle + Multi-language selector */}
          <div className="flex items-center gap-2 sm:gap-3.5 lg:gap-4 shrink-0">
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-4 lg:gap-5"
            >
              {navItems.map((item) => {
                const active =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative text-[14px] font-medium whitespace-nowrap shrink-0 py-1 transition-colors duration-200 group ${
                      transparentOverHero
                        ? 'text-white/95 hover:text-white'
                        : 'text-[#111111]/90 dark:text-white/90 hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-[#FF8A00] transition-transform duration-200 origin-left ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}

              {/* Circular Button after Gallery: points DOWN when closed, rotates UP when open */}
              <div ref={moreRef} className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setLangMenuOpen(false);
                    setMoreOpen((prev) => !prev);
                  }}
                  aria-label={t.nav.moreAria}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  title={t.nav.moreTitle}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] ${
                    moreOpen
                      ? 'bg-[#FF8A00] border border-[#FF8A00] text-white scale-105 shadow-[0_6px_18px_rgba(255,138,0,0.32)]'
                      : transparentOverHero
                        ? 'bg-transparent border border-white/28 text-white hover:bg-[#FF8A00] hover:border-[#FF8A00] hover:text-white hover:scale-105'
                        : 'bg-transparent border border-black/15 dark:border-white/22 text-[#0B1F5C] dark:text-white hover:bg-[#0B1F5C] hover:border-[#0B1F5C] hover:text-white dark:hover:bg-[#FF8A00] dark:hover:border-[#FF8A00] dark:hover:text-white hover:scale-105'
                  }`}
                >
                  <ChevronDown
                    className={`w-[18px] h-[18px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      moreOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    strokeWidth={2.3}
                  />
                </button>

                {moreOpen && (
                  <div
                    role="menu"
                    aria-label={t.nav.moreTitle}
                    className="absolute right-0 top-[calc(100%+14px)] w-64 rounded-[22px] bg-white/96 dark:bg-[#141926]/96 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_22px_50px_rgba(11,31,92,0.22)] p-2 text-[#111111] dark:text-[#F4F5F7] z-50"
                  >
                    <p className="px-3 pt-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                      {t.nav.moreTitle}
                    </p>
                    <div className="space-y-1">
                      {extraPages.map((page) => {
                        const Icon = page.icon;
                        const isActive = location.pathname === page.to;
                        return (
                          <Link
                            key={page.to}
                            to={page.to}
                            role="menuitem"
                            onClick={() => setMoreOpen(false)}
                            className={`flex items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
                              isActive
                                ? 'bg-[#0B1F5C] text-white dark:bg-[#FF8A00]'
                                : 'hover:bg-[#F6F5F2] dark:hover:bg-white/10'
                            }`}
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? 'text-white' : 'text-[#FF8A00]'
                                }`}
                              />
                              <span className="truncate">{page.label}</span>
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>

                    {user && (
                      <div className="mt-2 pt-2 border-t border-black/8 dark:border-white/10 space-y-1.5">
                        <div className="px-3 py-1.5 flex items-center justify-between gap-2 text-[12px] text-[#5A5A56] dark:text-[#A1A7B8]">
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <User className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                            <span className="truncate">{user.contactDisplay}</span>
                          </span>
                          {isOwner && (
                            <span className="rounded-full bg-[#FF8A00]/16 text-[#FF8A00] px-2 py-0.5 text-[10px] font-semibold shrink-0">
                              {t.auth.ownerBadge}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMoreOpen(false);
                            void logout();
                          }}
                          className="w-full flex items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>{t.auth.logout}</span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t.theme.toLight : t.theme.toDark}
              title={isDark ? t.theme.toLight : t.theme.toDark}
              className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-colors cursor-pointer shrink-0 ${
                transparentOverHero || mobileOpen
                  ? 'bg-white/15 border-white/25 text-white hover:bg-white/25 backdrop-blur-md'
                  : 'bg-[#F6F5F2]/80 dark:bg-white/10 border-black/10 dark:border-white/15 text-[#111111] dark:text-[#FF8A00] hover:border-[#0B1F5C] dark:hover:border-[#FF8A00]'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Multi-Language Dropdown Selector (12 Languages) */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setLangMenuOpen((prev) => !prev);
                }}
                aria-label={t.nav.languageAria}
                aria-expanded={langMenuOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[38px] border text-[12px] font-semibold uppercase tracking-wide transition-all cursor-pointer shrink-0 ${
                  transparentOverHero || mobileOpen
                    ? 'bg-white/15 border-white/25 text-white hover:bg-white/25 backdrop-blur-md'
                    : 'bg-[#F6F5F2]/85 dark:bg-white/10 border-black/10 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#0B1F5C] dark:hover:border-[#FF8A00]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                <span>{langMeta.shortCode}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
                    langMenuOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {langMenuOpen && (
                <div
                  role="menu"
                  aria-label={t.nav.languageTitle}
                  className="absolute right-0 top-[calc(100%+12px)] w-[300px] sm:w-[340px] rounded-[22px] bg-white/96 dark:bg-[#141926]/96 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_24px_56px_rgba(11,31,92,0.24)] p-2.5 text-[#111111] dark:text-[#F4F5F7] z-50"
                >
                  <p className="px-2.5 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                    {t.nav.languageTitle}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[65vh] overflow-y-auto pr-0.5">
                    {languages.map((item) => {
                      const isSelected = lang === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          role="menuitemradio"
                          aria-checked={isSelected}
                          onClick={() => {
                            setLang(item.code);
                            setLangMenuOpen(false);
                          }}
                          className={`flex items-center justify-between gap-2 rounded-[13px] px-2.5 py-2 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#0B1F5C] text-white dark:bg-[#FF8A00]'
                              : 'hover:bg-[#F6F5F2] dark:hover:bg-white/10'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium leading-tight truncate">
                              {item.nativeName}
                            </p>
                            <p
                              className={`text-[10px] leading-tight truncate mt-0.5 ${
                                isSelected
                                  ? 'text-white/80'
                                  : 'text-[#5A5A56] dark:text-[#A1A7B8]'
                              }`}
                            >
                              {item.shortCode} · {item.countryHint}
                            </p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
              aria-expanded={mobileOpen}
              className={`md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer ${
                transparentOverHero || mobileOpen
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-[#F6F5F2] dark:bg-white/10 text-[#111111] dark:text-white border border-black/10 dark:border-white/15'
              }`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-[#0B1F5C] dark:bg-[#070B14] text-white md:hidden flex flex-col justify-between pt-28 pb-8 px-6 overflow-y-auto">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-white/60">
              {t.brand.location}
            </p>
            <nav className="flex flex-col gap-2">
              {[
                ...navItems,
                {to: '/experience', label: t.nav.moreExperience},
                {to: '/faq', label: t.nav.moreFaq},
                {to: '/contact', label: t.nav.contact},
                ...(isOwner ? [{to: '/admin', label: t.nav.moreAdmin}] : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-xl sm:text-2xl font-light tracking-tight py-2.5 border-b border-white/10 hover:text-[#FF8A00] transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-5 h-5 opacity-60" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4 pt-8">
            <p className="text-sm text-white/75">{t.brand.tagline}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={buildTelegramDraftUrl(
                  getLatestTelegramDraft(t.inquirySection.telegramGreeting),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF8A00] text-white px-5 py-3 min-h-[44px] text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                <span>{t.floating.telegram}</span>
              </a>
              <a
                href={SITE_CONTACT.phoneHref}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#0B1F5C] px-5 py-3 min-h-[44px] text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                <span>{SITE_CONTACT.phoneDisplay}</span>
              </a>
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void logout();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 text-white px-5 py-3 min-h-[44px] text-sm font-medium hover:bg-red-500/80 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.auth.logout}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
