import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plane,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {TICKET_TRANSLATIONS} from '../i18n/ticketTranslations';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {
  AdminOverview,
  deleteInquiry,
  fetchAdminOverview,
  fetchInquiries,
  InquiryRecord,
  InquiryStatus,
  updateInquiryStatus,
} from '../services/inquiriesApi';
import {
  deleteTicket,
  fetchTickets,
  TicketRecord,
  TicketStatus,
  updateTicketStatus,
} from '../services/ticketsApi';
import {PillButton} from '../components/PillButton';

export function AdminPage() {
  const {user, isOwner, logout} = useAuth();
  const {lang, langMeta, t} = useLanguage();
  const tt = TICKET_TRANSLATIONS[lang] ?? TICKET_TRANSLATIONS.uz;
  useDocumentMeta(`${t.adminPage.title} — Horizo Tour`, t.adminPage.subtitle);

  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [activityTab, setActivityTab] = useState<'registered' | 'visits'>('registered');
  const [crmSection, setCrmSection] = useState<'inquiries' | 'tickets'>('inquiries');
  const [loadingList, setLoadingList] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteTicketId, setConfirmDeleteTicketId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    if (!isOwner) return;
    setLoadingList(true);
    setLoadError(false);
    try {
      const [items, ticketItems, overviewData] = await Promise.all([
        fetchInquiries(),
        fetchTickets(),
        fetchAdminOverview(),
      ]);
      setInquiries(items);
      setTickets(ticketItems);
      setOverview(overviewData);
    } catch {
      // Never auto-logout the owner on a transient fetch error; keep session open until explicit logout
      setLoadError(true);
    } finally {
      setLoadingList(false);
    }
  }, [isOwner]);

  useEffect(() => {
    if (isOwner) {
      void loadList();
    }
  }, [isOwner, loadList]);

  const handleLogout = async () => {
    await logout();
  };

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    try {
      const updated = await updateInquiryStatus(id, status);
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      // ignore error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInquiry(id);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteId(null);
    } catch {
      // ignore error
    }
  };

  const handleTicketStatusChange = async (id: string, status: TicketStatus) => {
    try {
      const updated = await updateTicketStatus(id, status);
      setTickets((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      // ignore error
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteTicketId(null);
    } catch {
      // ignore error
    }
  };

  const stats = useMemo(() => {
    return {
      uniqueStarts: overview?.stats.uniqueStarts ?? 0,
      totalStarts: overview?.stats.totalStarts ?? 0,
      registeredUsers: overview?.stats.registeredUsersCount ?? 0,
      ticketsCount: tickets.length,
      total: inquiries.length,
      newCount: inquiries.filter((i) => i.status === 'new').length,
      contactedCount: inquiries.filter((i) => i.status === 'contacted').length,
      bookedCount: inquiries.filter((i) => i.status === 'booked').length,
    };
  }, [inquiries, overview, tickets.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inquiries.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.destinationLabel.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [inquiries, search, statusFilter]);

  const filteredTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(
      (tk) =>
        tk.pnrCode.toLowerCase().includes(q) ||
        tk.passengerName.toLowerCase().includes(q) ||
        (tk.phone ?? '').toLowerCase().includes(q) ||
        tk.flightNumber.toLowerCase().includes(q) ||
        tk.destinationCode.toLowerCase().includes(q) ||
        tk.destinationCity.toLowerCase().includes(q),
    );
  }, [tickets, ticketSearch]);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(langMeta.intlLocale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const sourceLabel = (src: InquiryRecord['source']) => {
    if (src === 'home') return t.adminPage.sourceHome;
    if (src === 'modal') return t.adminPage.sourceModal;
    return t.adminPage.sourceContact;
  };

  const statusBadgeClass = (st: InquiryStatus) => {
    if (st === 'new') {
      return 'bg-[#FF8A00]/16 text-[#FF8A00] border-[#FF8A00]/30';
    }
    if (st === 'contacted') {
      return 'bg-sky-500/14 text-sky-700 dark:text-sky-300 border-sky-500/30';
    }
    return 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  };

  const recentUsers = overview?.recentUsers ?? [];
  const recentVisits = overview?.recentVisits ?? [];

  return (
    <main className="pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        {!isOwner ? (
          <div className="max-w-md mx-auto rounded-[28px] bg-white/95 dark:bg-[#141926]/95 p-7 sm:p-10 border border-black/8 dark:border-white/12 shadow-[0_18px_50px_rgba(11,31,92,0.12)] space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-light text-[#111111] dark:text-white">
                {t.auth.ownerOnlyTitle}
              </h1>
              <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                {t.auth.ownerOnlyText}
              </p>
            </div>
            <PillButton to="/" label={t.common.backHome} variant="navy" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Bar */}
            <div className="rounded-[24px] md:rounded-[30px] bg-white/95 dark:bg-[#141926]/95 p-6 sm:p-8 border border-black/6 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FF8A00]/14 text-[#FF8A00] px-3 py-1 text-[12px] font-medium mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {t.auth.ownerBadge} · {user?.contactDisplay}
                  </span>
                </div>
                <h1 className="text-[clamp(1.75rem,3vw,2.6rem)] font-light text-[#111111] dark:text-white">
                  {t.adminPage.title}
                </h1>
                <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1">
                  {t.adminPage.subtitle}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void loadList()}
                  disabled={loadingList}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F6F5F2] dark:bg-white/10 px-4 py-2.5 min-h-[44px] text-[13px] font-medium text-[#111111] dark:text-white hover:bg-[#FF8A00] hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
                  <span>{t.adminPage.refresh}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0B1F5C] dark:bg-white text-white dark:text-[#0B1F5C] px-4 py-2.5 min-h-[44px] text-[13px] font-medium hover:bg-[#FF8A00] dark:hover:bg-[#FF8A00] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.adminPage.logout}</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
              {/* Highlighted Focused Stat Card 1: Start bosganlar */}
              <div className="rounded-[22px] bg-white/95 dark:bg-[#141926]/95 p-5 border border-[#FF8A00]/35 dark:border-[#FF8A00]/35 shadow-[0_8px_24px_rgba(255,138,0,0.08)] flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                    {t.adminPage.statStarts}
                  </p>
                  <Activity className="w-4 h-4 text-[#FF8A00] shrink-0" />
                </div>
                <p className="text-3xl font-light mt-1.5 tabular-nums text-[#FF8A00]">
                  {stats.uniqueStarts}
                </p>
                <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1 tabular-nums">
                  {t.adminPage.statStartsHint.replace('${count}', String(stats.totalStarts))}
                </p>
              </div>

              {/* Stat Card 2: Ro'yxatdan o'tganlar */}
              <div className="rounded-[22px] bg-white/95 dark:bg-[#141926]/95 p-5 border border-black/6 dark:border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                    {t.adminPage.statRegistered}
                  </p>
                  <UserCheck className="w-4 h-4 text-[#0B1F5C] dark:text-sky-400 shrink-0" />
                </div>
                <p className="text-3xl font-light mt-1.5 tabular-nums text-[#0B1F5C] dark:text-white">
                  {stats.registeredUsers}
                </p>
                <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1">
                  {t.adminPage.statRegisteredHint}
                </p>
              </div>

              {/* Stat Card 3: Aviabiletlar */}
              <button
                type="button"
                onClick={() => setCrmSection('tickets')}
                className="text-left rounded-[22px] bg-white/95 dark:bg-[#141926]/95 p-5 border border-black/6 dark:border-white/10 hover:border-[#FF8A00]/50 transition-colors flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                    {tt.adminStatTickets}
                  </p>
                  <Plane className="w-4 h-4 text-[#FF8A00] shrink-0" />
                </div>
                <p className="text-3xl font-light mt-1.5 tabular-nums text-[#FF8A00]">
                  {stats.ticketsCount}
                </p>
                <span className="h-[15px]" aria-hidden="true" />
              </button>

              {[
                {
                  label: t.adminPage.statTotal,
                  value: stats.total,
                  accent: 'text-[#0B1F5C] dark:text-white',
                },
                {label: t.adminPage.statNew, value: stats.newCount, accent: 'text-[#FF8A00]'},
                {
                  label: t.adminPage.statContacted,
                  value: stats.contactedCount,
                  accent: 'text-sky-600 dark:text-sky-400',
                },
                {
                  label: t.adminPage.statBooked,
                  value: stats.bookedCount,
                  accent: 'text-emerald-600 dark:text-emerald-400',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[22px] bg-white/95 dark:bg-[#141926]/95 p-5 border border-black/6 dark:border-white/10 flex flex-col justify-between"
                >
                  <p className="text-[12px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-light mt-1.5 tabular-nums ${stat.accent}`}>
                    {stat.value}
                  </p>
                  <span className="h-[15px]" aria-hidden="true" />
                </div>
              ))}
            </div>

            {loadError && (
              <div
                role="alert"
                className="rounded-[20px] bg-amber-500/12 border border-amber-500/30 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-[14px] text-amber-800 dark:text-amber-300"
              >
                <span className="inline-flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{t.auth.loadError}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void loadList()}
                  className="rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-4 py-1.5 text-[13px] font-medium cursor-pointer"
                >
                  {t.auth.retry}
                </button>
              </div>
            )}

            {/* Concise Site Starts & Registered Users List */}
            <section className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-6 border border-black/6 dark:border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-[17px] font-medium text-[#111111] dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#FF8A00] shrink-0" />
                  <span>{t.adminPage.activityTitle}</span>
                </h2>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F5F2] dark:bg-[#0B0E17] p-1 border border-black/6 dark:border-white/10 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActivityTab('registered')}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                      activityTab === 'registered'
                        ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                        : 'text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {t.adminPage.tabRegistered} ({stats.registeredUsers})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityTab('visits')}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                      activityTab === 'visits'
                        ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                        : 'text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {t.adminPage.tabVisits} ({stats.uniqueStarts})
                  </button>
                </div>
              </div>

              {activityTab === 'registered' ? (
                recentUsers.length === 0 ? (
                  <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] py-4">
                    {t.adminPage.noUsers}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] px-4 py-3 border border-black/5 dark:border-white/8 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#0B1F5C]/10 dark:bg-white/10 text-[#0B1F5C] dark:text-[#FF8A00] flex items-center justify-center shrink-0">
                            {u.contactType === 'email' ? (
                              <Mail className="w-3.5 h-3.5" />
                            ) : (
                              <Phone className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#111111] dark:text-white truncate tabular-nums">
                              {u.contactDisplay}
                            </p>
                            <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8]">
                              {formatDate(u.createdAt)} ·{' '}
                              {u.contactType === 'email'
                                ? t.adminPage.contactTypeEmail
                                : t.adminPage.contactTypePhone}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${
                            u.role === 'owner'
                              ? 'bg-[#FF8A00]/16 text-[#FF8A00]'
                              : 'bg-black/6 dark:bg-white/10 text-[#5A5A56] dark:text-[#A1A7B8]'
                          }`}
                        >
                          {u.role === 'owner' ? t.auth.ownerBadge : t.adminPage.userRoleLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : recentVisits.length === 0 ? (
                <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] py-4">
                  {t.adminPage.noVisits}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {recentVisits.map((v, idx) => (
                    <div
                      key={`${v.visitorId}-${idx}`}
                      className="rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] px-4 py-3 border border-black/5 dark:border-white/8 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#FF8A00]/12 text-[#FF8A00] flex items-center justify-center shrink-0">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#111111] dark:text-white truncate">
                            {t.adminPage.visitorLabel} #{v.visitorId}
                          </p>
                          <p className="text-[11px] text-[#5A5A56] dark:text-[#A1A7B8]">
                            {formatDate(v.lastSeenAt)} ·{' '}
                            {t.adminPage.visitCountTemplate.replace(
                              '${count}',
                              String(v.visitsCount),
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-black/6 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-[#111111] dark:text-white shrink-0">
                        {v.lang}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* CRM Section Switcher: Inquiries vs Online Flight E-Tickets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCrmSection('inquiries')}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 min-h-[44px] text-[14px] font-medium transition-colors cursor-pointer ${
                  crmSection === 'inquiries'
                    ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                    : 'bg-white/95 dark:bg-[#141926]/95 border border-black/8 dark:border-white/12 text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {tt.adminTabInquiries} ({stats.total})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCrmSection('tickets')}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 min-h-[44px] text-[14px] font-medium transition-colors cursor-pointer ${
                  crmSection === 'tickets'
                    ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                    : 'bg-white/95 dark:bg-[#141926]/95 border border-black/8 dark:border-white/12 text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span>
                  {tt.adminTabTickets} ({stats.ticketsCount})
                </span>
              </button>
            </div>

            {crmSection === 'tickets' ? (
              <div className="space-y-4">
                <div className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-4 sm:p-5 border border-black/6 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-[17px] font-medium text-[#111111] dark:text-white flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#FF8A00]" />
                    <span>{tt.adminTicketsTitle}</span>
                  </h2>

                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-[#5A5A56] dark:text-[#A1A7B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      placeholder={tt.adminSearchTicketsPlaceholder}
                      className="w-full rounded-full bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/6 dark:border-white/10 pl-10 pr-4 py-2.5 min-h-[42px] text-[14px] text-[#111111] dark:text-white focus:outline-none focus:border-[#0B1F5C] dark:focus:border-[#FF8A00]"
                    />
                  </div>
                </div>

                {filteredTickets.length === 0 ? (
                  <div className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-12 border border-black/6 dark:border-white/10 text-center text-[#5A5A56] dark:text-[#A1A7B8]">
                    {tt.adminEmptyTickets}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredTickets.map((tk) => (
                      <article
                        key={tk.id}
                        className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-6 border border-black/6 dark:border-white/10 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="rounded-full bg-[#0B1F5C] dark:bg-[#FF8A00] text-white px-3 py-0.5 text-[12px] font-bold tracking-wider tabular-nums">
                                  {tk.pnrCode}
                                </span>
                                <span className="text-[14px] font-semibold text-[#111111] dark:text-white">
                                  {tk.originCode} → {tk.destinationCode} ({tk.destinationCity})
                                </span>
                              </div>
                              <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1.5 tabular-nums">
                                {tk.airline} · {tk.flightNumber} · {tk.departureDate} (
                                {tk.departureTime}–{tk.arrivalTime})
                              </p>
                            </div>

                            <span className="text-[19px] font-semibold text-[#FF8A00] tabular-nums">
                              ${tk.totalPriceUsd}
                            </span>
                          </div>

                          <div className="rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-3.5 text-[13px] space-y-1">
                            <p className="font-medium text-[#111111] dark:text-white">
                              {tk.passengerName} · {tk.passengers} pax ·{' '}
                              {tk.cabin === 'business' ? tt.cabinBusiness : tt.cabinEconomy}
                              {tk.passportLast4 ? ` · •••• ${tk.passportLast4}` : ''}
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[#5A5A56] dark:text-[#A1A7B8]">
                              {tk.phone ? (
                                <a
                                  href={`tel:${tk.phone.replace(/\s+/g, '')}`}
                                  className="inline-flex items-center gap-1.5 text-[#0B1F5C] dark:text-[#FF8A00] font-medium hover:underline tabular-nums"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  {tk.phone}
                                </a>
                              ) : (
                                <span />
                              )}
                              <span>{formatDate(tk.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-black/6 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(
                              [
                                {val: 'pending_payment', label: tt.statusPendingPayment},
                                {val: 'paid', label: tt.statusPaid},
                                {val: 'issued', label: tt.statusIssued},
                                {val: 'confirmed', label: tt.statusConfirmed},
                                {val: 'cancelled', label: tt.statusCancelled},
                                {val: 'expired', label: tt.statusExpired},
                              ] as const
                            ).map((opt) => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => void handleTicketStatusChange(tk.id, opt.val)}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 min-h-[34px] text-[11.5px] font-medium transition-colors cursor-pointer ${
                                  tk.status === opt.val
                                    ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                                    : 'bg-[#F6F5F2] dark:bg-white/10 text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                                }`}
                              >
                                {tk.status === opt.val && <CheckCircle2 className="w-3 h-3" />}
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/ticket/${tk.pnrCode}`}
                              aria-label={tt.openVerifyPageBtn}
                              className="w-9 h-9 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#0B1F5C] dark:text-white hover:bg-[#0B1F5C] hover:text-white dark:hover:bg-[#FF8A00] flex items-center justify-center transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {tk.phone && (
                              <a
                                href={`https://t.me/+${tk.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Telegram"
                                className="w-9 h-9 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#0B1F5C] dark:text-white hover:bg-[#FF8A00] hover:text-white flex items-center justify-center transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </a>
                            )}

                            {confirmDeleteTicketId === tk.id ? (
                              <button
                                type="button"
                                onClick={() => void handleDeleteTicket(tk.id)}
                                className="rounded-full bg-red-600 text-white px-3 py-1.5 min-h-[36px] text-[12px] font-medium hover:bg-red-700 cursor-pointer"
                              >
                                {t.adminPage.deleteBtn} ✓
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteTicketId(tk.id)}
                                aria-label={t.adminPage.deleteBtn}
                                className="w-9 h-9 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Filters + Search */}
                <div className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-4 sm:p-5 border border-black/6 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        {id: 'all', label: t.adminPage.filterAll},
                        {id: 'new', label: t.adminPage.statusNew},
                        {id: 'contacted', label: t.adminPage.statusContacted},
                        {id: 'booked', label: t.adminPage.statusBooked},
                      ] as const
                    ).map((pill) => {
                      const active = statusFilter === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setStatusFilter(pill.id)}
                          className={`px-4 py-2 min-h-[40px] rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                              : 'bg-[#F6F5F2] dark:bg-white/10 text-[#111111] dark:text-white hover:bg-black/8 dark:hover:bg-white/20'
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-[#5A5A56] dark:text-[#A1A7B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t.adminPage.searchPlaceholder}
                      className="w-full rounded-full bg-[#F6F5F2] dark:bg-[#0B0E17] border border-black/6 dark:border-white/10 pl-10 pr-4 py-2.5 min-h-[42px] text-[14px] text-[#111111] dark:text-white focus:outline-none focus:border-[#0B1F5C] dark:focus:border-[#FF8A00]"
                    />
                  </div>
                </div>

                {/* Leads List */}
                {filtered.length === 0 ? (
                  <div className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-12 border border-black/6 dark:border-white/10 text-center text-[#5A5A56] dark:text-[#A1A7B8]">
                    {t.adminPage.empty}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-[24px] bg-white/95 dark:bg-[#141926]/95 p-5 sm:p-6 border border-black/6 dark:border-white/10 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h2 className="text-[19px] font-medium text-[#111111] dark:text-white">
                                {item.name}
                              </h2>
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDate(item.createdAt)}
                                </span>
                                <span className="rounded-full bg-[#F6F5F2] dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
                                  {sourceLabel(item.source)}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${statusBadgeClass(
                                item.status,
                              )}`}
                            >
                              {item.status === 'new'
                                ? t.adminPage.statusNew
                                : item.status === 'contacted'
                                  ? t.adminPage.statusContacted
                                  : t.adminPage.statusBooked}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 text-[14px]">
                            <a
                              href={`tel:${item.phone.replace(/\s+/g, '')}`}
                              className="inline-flex items-center gap-1.5 font-medium text-[#0B1F5C] dark:text-[#FF8A00] hover:underline tabular-nums"
                            >
                              <Phone className="w-4 h-4" />
                              {item.phone}
                            </a>
                            {item.destinationLabel && item.destinationLabel !== '-' && (
                              <span className="inline-flex items-center gap-1.5 text-[#111111] dark:text-[#F4F5F7]">
                                <MapPin className="w-4 h-4 text-[#FF8A00]" />
                                {item.destinationLabel}
                              </span>
                            )}
                          </div>

                          {item.message && (
                            <div className="rounded-[16px] bg-[#F6F5F2] dark:bg-[#0B0E17] p-3.5 text-[14px] text-[#111111] dark:text-[#F4F5F7] flex items-start gap-2.5">
                              <MessageSquare className="w-4 h-4 text-[#5A5A56] dark:text-[#A1A7B8] shrink-0 mt-0.5" />
                              <p className="leading-relaxed whitespace-pre-wrap">{item.message}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Row */}
                        <div className="pt-3 border-t border-black/6 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(
                              [
                                {val: 'new', label: t.adminPage.statusNew},
                                {val: 'contacted', label: t.adminPage.statusContacted},
                                {val: 'booked', label: t.adminPage.statusBooked},
                              ] as const
                            ).map((opt) => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => void handleStatusChange(item.id, opt.val)}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 min-h-[36px] text-[12px] font-medium transition-colors cursor-pointer ${
                                  item.status === opt.val
                                    ? 'bg-[#0B1F5C] dark:bg-[#FF8A00] text-white'
                                    : 'bg-[#F6F5F2] dark:bg-white/10 text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#111111] dark:hover:text-white'
                                }`}
                              >
                                {item.status === opt.val && <CheckCircle2 className="w-3 h-3" />}
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://t.me/+${item.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Telegram"
                              className="w-9 h-9 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-[#0B1F5C] dark:text-white hover:bg-[#FF8A00] hover:text-white flex items-center justify-center transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </a>

                            {confirmDeleteId === item.id ? (
                              <button
                                type="button"
                                onClick={() => void handleDelete(item.id)}
                                className="rounded-full bg-red-600 text-white px-3 py-1.5 min-h-[36px] text-[12px] font-medium hover:bg-red-700 cursor-pointer"
                              >
                                {t.adminPage.deleteBtn} ✓
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(item.id)}
                                aria-label={t.adminPage.deleteBtn}
                                className="w-9 h-9 rounded-full bg-[#F6F5F2] dark:bg-white/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
