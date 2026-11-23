import React, {useEffect, useRef, useState} from 'react';
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  UserPlus,
  LogIn,
} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {useTheme} from '../context/ThemeContext';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Logo} from './Logo';

type AuthMode = 'register' | 'login';

export function AuthGate() {
  const {lang, langMeta, languages, setLang, t} = useLanguage();
  const {theme, toggleTheme} = useTheme();
  const {register, login} = useAuth();

  useDocumentMeta(`${t.auth.securityBadge} — Horizo Tour`, t.auth.securityNote);

  const [mode, setMode] = useState<AuthMode>('register');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!langMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [langMenuOpen]);

  const validateClient = (): string | null => {
    const trimmed = contact.trim();
    if (!trimmed) {
      return t.auth.invalidContact;
    }
    if (trimmed.includes('@')) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
      if (!emailOk) return t.auth.invalidContact;
    } else {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 15) return t.auth.invalidContact;
    }
    if (password.length < 6) {
      return t.auth.shortPassword;
    }
    return null;
  };

  const mapServerError = (code: string): string => {
    switch (code) {
      case 'INVALID_CONTACT':
        return t.auth.invalidContact;
      case 'INVALID_PASSWORD':
        return t.auth.shortPassword;
      case 'ACCOUNT_EXISTS':
        return t.auth.accountExists;
      case 'INVALID_CREDENTIALS':
        return t.auth.invalidCredentials;
      default:
        return t.auth.genericError;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateClient();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        await register(contact.trim(), password);
      } else {
        await login(contact.trim(), password);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(mapServerError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 min-h-dvh flex flex-col text-[#111111] dark:text-[#F4F5F7]">
      {/* Top utility bar with explicit z-40 so language dropdown always floats above the auth card */}
      <header className="relative z-40 px-3 sm:px-7 lg:px-12 pt-3 sm:pt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[60px] sm:h-[62px] rounded-full bg-white/75 dark:bg-[#141926]/80 backdrop-blur-2xl border border-white/70 dark:border-white/15 shadow-[0_12px_36px_rgba(11,31,92,0.08)] flex items-center justify-between gap-4">
          <div className="shrink-0">
            <Logo variant={isDark ? 'light' : 'dark'} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t.theme.toLight : t.theme.toDark}
              title={isDark ? t.theme.toLight : t.theme.toDark}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F6F5F2]/85 dark:bg-white/10 border border-black/10 dark:border-white/15 text-[#111111] dark:text-[#FF8A00] hover:border-[#0B1F5C] dark:hover:border-[#FF8A00] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                aria-label={t.nav.languageAria}
                aria-expanded={langMenuOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[38px] bg-[#F6F5F2]/85 dark:bg-white/10 border border-black/10 dark:border-white/15 text-[12px] font-semibold uppercase tracking-wide text-[#111111] dark:text-white hover:border-[#0B1F5C] dark:hover:border-[#FF8A00] transition-colors cursor-pointer"
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
                  className="absolute right-0 top-[calc(100%+12px)] w-[290px] sm:w-[340px] rounded-[22px] bg-white dark:bg-[#141926] border border-black/10 dark:border-white/15 shadow-[0_24px_56px_rgba(11,31,92,0.28)] p-2.5 text-[#111111] dark:text-[#F4F5F7] z-50"
                >
                  <p className="px-2.5 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#5A5A56] dark:text-[#A1A7B8]">
                    {t.nav.languageTitle}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[60dvh] overflow-y-auto pr-0.5">
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
          </div>
        </div>
      </header>

      {/* Full-screen on mobile & tablet, centered compact card on desktop */}
      <main className="relative z-10 flex-1 flex flex-col lg:items-center lg:justify-center px-3 sm:px-6 lg:px-10 pt-3 pb-4 lg:py-10">
        <div className="flex-1 lg:flex-none w-full lg:max-w-[460px] mx-auto rounded-[24px] sm:rounded-[28px] bg-white/95 dark:bg-[#141926]/95 backdrop-blur-2xl p-5 sm:p-8 lg:p-9 border border-black/8 dark:border-white/12 shadow-[0_24px_64px_rgba(11,31,92,0.16)] flex flex-col justify-center space-y-6">
          {/* Security Trust Banner */}
          <div className="rounded-[20px] bg-[#0B1F5C]/[0.05] dark:bg-white/[0.06] border border-[#0B1F5C]/12 dark:border-white/12 p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FF8A00]">
                {t.auth.securityBadge}
              </p>
              <h1 className="text-[19px] sm:text-[21px] font-medium text-[#111111] dark:text-white leading-snug">
                {t.auth.securityHeading}
              </h1>
              <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                {t.auth.securityNote}
              </p>
            </div>
          </div>

          {/* Mode Tabs: Register / Sign In */}
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#F6F5F2] dark:bg-[#0B0E17] p-1 border border-black/6 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`rounded-full py-2.5 min-h-[42px] text-[13px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white shadow-sm'
                  : 'text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.auth.registerTab}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-full py-2.5 min-h-[42px] text-[13px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white shadow-sm'
                  : 'text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.auth.loginTab}</span>
            </button>
          </div>

          <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">
            {mode === 'register' ? t.auth.registerTitle : t.auth.loginTitle}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="auth-contact"
                className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]"
              >
                {t.auth.contactLabel}
              </label>
              <input
                id="auth-contact"
                type="text"
                autoComplete="username"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t.auth.contactPlaceholder}
                className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] px-4 py-3 min-h-[48px] text-[15px] text-[#111111] dark:text-white placeholder:text-[#5A5A56]/60 dark:placeholder:text-[#A1A7B8]/50 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="block text-[13px] font-medium text-[#111111] dark:text-[#F4F5F7]"
              >
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/8 dark:border-white/12 focus:border-[#0B1F5C] dark:focus:border-[#FF8A00] pl-4 pr-12 py-3 min-h-[48px] text-[15px] text-[#111111] dark:text-white placeholder:text-[#5A5A56]/60 dark:placeholder:text-[#A1A7B8]/50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[14px] bg-red-500/10 border border-red-500/25 px-3.5 py-2.5 text-[13px] text-red-600 dark:text-red-400"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white hover:bg-[#FF8A00] dark:hover:bg-[#ff9c26] disabled:opacity-60 px-6 py-3.5 min-h-[50px] text-[15px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(11,31,92,0.22)]"
            >
              <Lock className="w-4 h-4" />
              <span>
                {submitting
                  ? t.auth.submitting
                  : mode === 'register'
                    ? t.auth.registerBtn
                    : t.auth.loginBtn}
              </span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
