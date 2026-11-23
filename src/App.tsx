import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes, useLocation} from 'react-router-dom';
import {MotionConfig} from 'motion/react';
import {AuthProvider, useAuth} from './context/AuthContext';
import {LanguageProvider, useLanguage} from './context/LanguageContext';
import {ThemeProvider, useTheme} from './context/ThemeContext';
import {AuthGate} from './components/AuthGate';
import {CursorAuroraBackdrop} from './components/CursorAuroraBackdrop';
import {Header} from './components/Header';
import {Footer} from './components/Footer';
import {FloatingContact} from './components/FloatingContact';
import {Logo} from './components/Logo';
import {recordSiteStart} from './services/inquiriesApi';
import {HomePage} from './pages/HomePage';
import {ToursPage} from './pages/ToursPage';
import {TourDetailPage} from './pages/TourDetailPage';
import {AboutPage} from './pages/AboutPage';
import {BlogPage} from './pages/BlogPage';
import {BlogDetailPage} from './pages/BlogDetailPage';
import {GalleryPage} from './pages/GalleryPage';
import {ContactPage} from './pages/ContactPage';
import {ExperiencePage} from './pages/ExperiencePage';
import {FaqPage} from './pages/FaqPage';
import {AdminPage} from './pages/AdminPage';
import {LegalPage} from './pages/LegalPage';
import {TicketVerifyPage} from './pages/TicketVerifyPage';
import {TicketPaymentPage} from './pages/TicketPaymentPage';
import {NotFoundPage} from './pages/NotFoundPage';

function ScrollToTop() {
  const {pathname, hash} = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function AppShell() {
  const {pathname} = useLocation();
  const {loading, isAuthenticated} = useAuth();
  const {lang, t} = useLanguage();
  const {theme} = useTheme();

  useEffect(() => {
    void recordSiteStart(lang);
  }, [lang]);

  const isPublicTicketRoute = pathname.startsWith('/ticket/');
  if (isPublicTicketRoute) {
    return (
      <Routes>
        <Route path="/ticket/pay/:pnr" element={<TicketPaymentPage />} />
        <Route path="/ticket/:pnr" element={<TicketVerifyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="rounded-[28px] bg-white/85 dark:bg-[#141926]/85 backdrop-blur-2xl border border-black/8 dark:border-white/12 px-8 py-7 shadow-[0_18px_50px_rgba(11,31,92,0.12)] flex flex-col items-center gap-3 text-center">
          <Logo variant={theme === 'dark' ? 'light' : 'dark'} />
          <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8]">
            {t.auth.checkingSession}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col text-[#111111] dark:text-[#F4F5F7] transition-colors duration-200">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:slug" element={<TourDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy" element={<LegalPage mode="privacy" />} />
          <Route path="/terms" element={<LegalPage mode="terms" />} />
          <Route path="/ticket/pay/:pnr" element={<TicketPaymentPage />} />
          <Route path="/ticket/:pnr" element={<TicketVerifyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
      <FloatingContact />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <CursorAuroraBackdrop />
              <AppShell />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
