import type {Language} from './languages';

export interface TicketTranslationBlock {
  tabTours: string;
  tabFlights: string;
  badge: string;
  title: string;
  subtitle: string;
  originLabel: string;
  destinationLabel: string;
  dateLabel: string;
  passengersLabel: string;
  cabinLabel: string;
  cabinEconomy: string;
  cabinBusiness: string;
  directFlight: string;
  oneStop: string;
  baggageLabel: string;
  selectFlightBtn: string;
  selectedFlightBtn: string;
  noFlightsFound: string;
  perPassenger: string;
  totalPriceLabel: string;
  passengerFormTitle: string;
  passengerFormSubtitle: string;
  passengerNameLabel: string;
  passengerNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  passportLabel: string;
  passportPlaceholder: string;
  passportHint: string;
  issueBtn: string;
  issuingBtn: string;
  validationError: string;
  issueError: string;
  // 5-minute payment stage
  paymentStageBadge: string;
  paymentTitle: string;
  paymentSubtitle: string;
  paymentCountdownLabel: string;
  paymentScanHint: string;
  paymentAmountLabel: string;
  paymentConfirmBtn: string;
  paymentConfirmingBtn: string;
  paymentAiPreparing: string;
  paymentExpiredTitle: string;
  paymentExpiredText: string;
  paymentRetryBookingBtn: string;
  paymentAiRetryBtn: string;
  paymentCancelBtn: string;
  paymentPollingActive: string;
  // Issued & Verification Ticket
  ticketIssuedTitle: string;
  ticketIssuedSubtitle: string;
  pnrLabel: string;
  flightLabel: string;
  routeLabel: string;
  passengerLabel: string;
  passengersCountLabel: string;
  totalPaidLabel: string;
  passportMaskLabel: string;
  statusPendingPayment: string;
  statusPaid: string;
  statusIssued: string;
  statusConfirmed: string;
  statusCancelled: string;
  statusExpired: string;
  aiBriefTitle: string;
  aiCheckInLabel: string;
  aiBaggageLabel: string;
  aiArrivalLabel: string;
  qrVerifyNote: string;
  printBtn: string;
  copyBtn: string;
  copiedBtn: string;
  telegramBtn: string;
  telegramAppBtn: string;
  telegramDraftHint: string;
  bookAnotherBtn: string;
  openVerifyPageBtn: string;
  // Verify page & Mobile QR payment page
  verifyPageTitle: string;
  verifyPageSubtitle: string;
  verifyAuthenticBadge: string;
  verifyNotFoundTitle: string;
  verifyNotFoundText: string;
  verifyBackSiteBtn: string;
  mobilePayTitle: string;
  mobilePaySuccessTitle: string;
  mobilePaySuccessText: string;
  // Admin CRM
  adminTabInquiries: string;
  adminTabTickets: string;
  adminStatTickets: string;
  adminTicketsTitle: string;
  adminEmptyTickets: string;
  adminSearchTicketsPlaceholder: string;
}

const uz: TicketTranslationBlock = {
  tabTours: 'Tur paketlar',
  tabFlights: 'Onlayn Aviabiletlar',
  badge: 'Avtomatik E-Chipta va QR To‘lov Tizimi',
  title: 'Onlayn aviabilet tanlash va rasmiylashtirish',
  subtitle:
    'Reysni tanlang, yo‘lovchi ma’lumotlarini kiriting, 5 daqiqalik QR to‘lovni tasdiqlang va Sun’iy Intellekt tayyorlagan rasmiy elektron chiptangizni oling.',
  originLabel: 'Qayerdan',
  destinationLabel: 'Qayerga',
  dateLabel: 'Uchish sanasi',
  passengersLabel: 'Yo‘lovchilar',
  cabinLabel: 'Klass',
  cabinEconomy: 'Ekonom',
  cabinBusiness: 'Biznes',
  directFlight: 'To‘g‘ridan-to‘g‘ri',
  oneStop: '1 ta o‘tish',
  baggageLabel: 'Bagaj',
  selectFlightBtn: 'Reysni tanlash',
  selectedFlightBtn: 'Tanlandi ✓',
  noFlightsFound: 'Tanlangan yo‘nalish bo‘yicha reys topilmadi.',
  perPassenger: '1 kishi uchun',
  totalPriceLabel: 'Jami summa',
  passengerFormTitle: 'Yo‘lovchi ma’lumotlari',
  passengerFormSubtitle:
    'Keyingi bosqichda 5 daqiqalik QR to‘lov oynasi ochiladi. To‘lov bajarilgach Sun’iy Intellekt rasmiy chiptangizni avtomatik tayyorlaydi.',
  passengerNameLabel: 'Yo‘lovchi F.I.Sh.',
  passengerNamePlaceholder: 'Masalan, Sardorbek Karimov',
  phoneLabel: 'Telefon raqami',
  phonePlaceholder: '+998 90 123 45 67',
  passportLabel: 'Pasport / ID raqami (ixtiyoriy)',
  passportPlaceholder: 'FA1234567',
  passportHint: 'Xavfsizlik uchun chiptada faqat oxirgi 4 ta belgisi ko‘rsatiladi.',
  issueBtn: 'To‘lovga o‘tish (5:00)',
  issuingBtn: 'Bron va to‘lov QR yaratilmoqda...',
  validationError: 'Iltimos, yo‘lovchi ismi va to‘g‘ri telefon raqamini kiriting.',
  issueError: 'Amalni bajarishda xatolik yuz berdi. Qayta urinib ko‘ring.',
  paymentStageBadge: '5 Daqiqalik Avto To‘lov Oynasi',
  paymentTitle: 'To‘lovni QR kod orqali tasdiqlang',
  paymentSubtitle:
    'Telefoningizda QR kodni skanerlang yoki pastdagi tezkor tasdiqlash tugmasini bosing. To‘lov qilinishi bilan Sun’iy Intellekt chiptangizni darhol tayyorlaydi.',
  paymentCountdownLabel: 'Qolgan vaqt',
  paymentScanHint: 'Telefon kamerasida skanerlab tasdiqlash ham mumkin',
  paymentAmountLabel: 'To‘lov summasi',
  paymentConfirmBtn: 'To‘lovni avtomatik tasdiqlash',
  paymentConfirmingBtn: 'To‘lov tekshirilmoqda...',
  paymentAiPreparing: 'To‘lov qabul qilindi! Sun’iy Intellekt chiptangizni tayyorlamoqda...',
  paymentExpiredTitle: '5 daqiqalik to‘lov muddati tugadi',
  paymentExpiredText:
    'Xavfsizlik maqsadida bron bekor qilindi. Yangi QR to‘lov yaratish uchun qayta yuboring.',
  paymentRetryBookingBtn: 'Qayta bron qilish',
  paymentAiRetryBtn: 'Chiptani tayyorlashni qayta urinish',
  paymentCancelBtn: 'Orqaga qaytish',
  paymentPollingActive: 'Telefonda to‘lov tasdiqlanishini kutmoqda...',
  ticketIssuedTitle: 'Rasmiy elektron chiptangiz tayyor!',
  ticketIssuedSubtitle:
    'To‘lov tasdiqlandi va Sun’iy Intellekt tomonidan parvoz yo‘riqnomasi bilan tayyorlandi.',
  pnrLabel: 'Bron kodi (PNR)',
  flightLabel: 'Reys',
  routeLabel: 'Marshrut',
  passengerLabel: 'Yo‘lovchi',
  passengersCountLabel: 'Yo‘lovchilar',
  totalPaidLabel: 'To‘langan summa',
  passportMaskLabel: 'Hujjat',
  statusPendingPayment: 'To‘lov kutilmoqda',
  statusPaid: 'To‘langan',
  statusIssued: 'Rasmiy chipta tayyor',
  statusConfirmed: 'Tasdiqlangan',
  statusCancelled: 'Bekor qilingan',
  statusExpired: 'Muddati o‘tgan',
  aiBriefTitle: 'Sun’iy Intellekt parvoz yo‘riqnomasi',
  aiCheckInLabel: 'Ro‘yxatdan o‘tish',
  aiBaggageLabel: 'Bagaj talablari',
  aiArrivalLabel: 'Yetib borish maslahati',
  qrVerifyNote: 'Telefon bilan skanerlaganda rasmiy chipta tekshirish sahifasi ochiladi',
  printBtn: 'Chop etish / PDF',
  copyBtn: 'Ma’lumotni nusxalash',
  copiedBtn: 'Nusxalandi ✓',
  telegramBtn: 'Telegramda yuborish (@why_zuxaa)',
  telegramAppBtn: 'Telegram ilovada ochish',
  telegramDraftHint:
    'Tugmani bossangiz bilet matni avtomatik chernovik sifatida lichkaga ochiladi.',
  bookAnotherBtn: 'Yangi bilet rasmiylashtirish',
  openVerifyPageBtn: 'Tekshirish sahifasini ochish',
  verifyPageTitle: 'Rasmiy Elektron Chipta Tekshiruvi',
  verifyPageSubtitle: 'Horizo Tour tizimi orqali tasdiqlangan haqiqiy parvoz hujjati',
  verifyAuthenticBadge: 'Haqiqiy chipta tasdiqlandi',
  verifyNotFoundTitle: 'Bunday bron kodi topilmadi',
  verifyNotFoundText:
    'QR koddagi bron raqami noto‘g‘ri yoki o‘chirilgan bo‘lishi mumkin. Menejer bilan bog‘laning.',
  verifyBackSiteBtn: 'Asosiy saytga o‘tish',
  mobilePayTitle: 'Onlayn Chipta To‘lovini Tasdiqlash',
  mobilePaySuccessTitle: 'To‘lov muvaffaqiyatli tasdiqlandi!',
  mobilePaySuccessText:
    'Sun’iy Intellekt elektron chiptangizni tayyorladi. Endi chiptani ochishingiz mumkin.',
  adminTabInquiries: 'Tur so‘rovlari',
  adminTabTickets: 'Onlayn aviabiletlar',
  adminStatTickets: 'Aviabiletlar',
  adminTicketsTitle: 'QR to‘lov va AI orqali rasmiylashtirilgan biletlar',
  adminEmptyTickets: 'Hozircha onlayn rasmiylashtirilgan biletlar yo‘q.',
  adminSearchTicketsPlaceholder: 'PNR kodi, yo‘lovchi, telefon yoki reys bo‘yicha qidirish...',
};

const ru: TicketTranslationBlock = {
  tabTours: 'Турпакеты',
  tabFlights: 'Онлайн Авиабилеты',
  badge: 'Автоматическая QR-оплата и AI E-Ticket',
  title: 'Поиск и оформление авиабилета онлайн',
  subtitle:
    'Выберите рейс, введите данные пассажира, подтвердите оплату по QR за 5 минут и получите электронный билет, подготовленный ИИ.',
  originLabel: 'Откуда',
  destinationLabel: 'Куда',
  dateLabel: 'Дата вылета',
  passengersLabel: 'Пассажиры',
  cabinLabel: 'Класс',
  cabinEconomy: 'Эконом',
  cabinBusiness: 'Бизнес',
  directFlight: 'Прямой рейс',
  oneStop: '1 пересадка',
  baggageLabel: 'Багаж',
  selectFlightBtn: 'Выбрать рейс',
  selectedFlightBtn: 'Выбран ✓',
  noFlightsFound: 'Рейсы по выбранному маршруту не найдены.',
  perPassenger: 'за 1 пассажира',
  totalPriceLabel: 'Итоговая стоимость',
  passengerFormTitle: 'Данные пассажира',
  passengerFormSubtitle:
    'На следующем шаге откроется 5-минутное окно оплаты по QR. После оплаты ИИ автоматически сформирует ваш официальный билет.',
  passengerNameLabel: 'ФИО пассажира',
  passengerNamePlaceholder: 'Например, Сардорбек Каримов',
  phoneLabel: 'Номер телефона',
  phonePlaceholder: '+998 90 123 45 67',
  passportLabel: 'Серия и номер паспорта (необязательно)',
  passportPlaceholder: 'FA1234567',
  passportHint: 'Для безопасности отображаются только последние 4 символа.',
  issueBtn: 'Перейти к оплате (5:00)',
  issuingBtn: 'Создаём бронь и QR для оплаты...',
  validationError: 'Пожалуйста, введите имя пассажира и корректный номер телефона.',
  issueError: 'Произошла ошибка. Попробуйте ещё раз.',
  paymentStageBadge: 'Окно оплаты 5 минут',
  paymentTitle: 'Подтвердите оплату по QR-коду',
  paymentSubtitle:
    'Отсканируйте QR-код телефоном или нажмите кнопку авто-подтверждения ниже. Сразу после оплаты ИИ подготовит ваш билет.',
  paymentCountdownLabel: 'Осталось времени',
  paymentScanHint: 'Можно отсканировать камерой телефона',
  paymentAmountLabel: 'Сумма к оплате',
  paymentConfirmBtn: 'Подтвердить оплату автоматически',
  paymentConfirmingBtn: 'Проверяем оплату...',
  paymentAiPreparing: 'Оплата получена! ИИ подготавливает ваш официальный билет...',
  paymentExpiredTitle: 'Время оплаты (5 минут) истекло',
  paymentExpiredText: 'Бронь аннулирована. Отправьте форму снова для нового QR-кода.',
  paymentRetryBookingBtn: 'Забронировать заново',
  paymentAiRetryBtn: 'Повторить подготовку билета',
  paymentCancelBtn: 'Назад',
  paymentPollingActive: 'Ожидание подтверждения оплаты с телефона...',
  ticketIssuedTitle: 'Ваш официальный электронный билет готов!',
  ticketIssuedSubtitle: 'Оплата подтверждена, ИИ добавил персональную памятку по вылету.',
  pnrLabel: 'Код брони (PNR)',
  flightLabel: 'Рейс',
  routeLabel: 'Маршрут',
  passengerLabel: 'Пассажир',
  passengersCountLabel: 'Пассажиров',
  totalPaidLabel: 'Оплачено',
  passportMaskLabel: 'Документ',
  statusPendingPayment: 'Ожидает оплаты',
  statusPaid: 'Оплачено',
  statusIssued: 'Билет выпущен',
  statusConfirmed: 'Подтверждён',
  statusCancelled: 'Отменён',
  statusExpired: 'Истёк',
  aiBriefTitle: 'Памятка от ИИ по перелёту',
  aiCheckInLabel: 'Регистрация',
  aiBaggageLabel: 'Багаж',
  aiArrivalLabel: 'Прибытие',
  qrVerifyNote: 'При сканировании откроется официальная страница проверки билета',
  printBtn: 'Печать / PDF',
  copyBtn: 'Скопировать данные',
  copiedBtn: 'Скопировано ✓',
  telegramBtn: 'Отправить в Telegram (@why_zuxaa)',
  telegramAppBtn: 'Открыть в приложении Telegram',
  telegramDraftHint: 'Текст билета откроется готовым черновиком в личных сообщениях.',
  bookAnotherBtn: 'Оформить ещё один билет',
  openVerifyPageBtn: 'Открыть страницу проверки',
  verifyPageTitle: 'Официальная проверка электронного билета',
  verifyPageSubtitle: 'Подлинный проездной документ, подтверждённый в системе Horizo Tour',
  verifyAuthenticBadge: 'Подлинный билет подтверждён',
  verifyNotFoundTitle: 'Бронь с таким кодом не найдена',
  verifyNotFoundText: 'Проверьте QR-код или свяжитесь с нашим менеджером.',
  verifyBackSiteBtn: 'На главную сайта',
  mobilePayTitle: 'Подтверждение оплаты авиабилета',
  mobilePaySuccessTitle: 'Оплата успешно подтверждена!',
  mobilePaySuccessText: 'ИИ подготовил ваш электронный билет. Теперь вы можете открыть его.',
  adminTabInquiries: 'Заявки на туры',
  adminTabTickets: 'Авиабилеты онлайн',
  adminStatTickets: 'Авиабилеты',
  adminTicketsTitle: 'Авиабилеты (QR-оплата и AI-подготовка)',
  adminEmptyTickets: 'Пока нет оформленных онлайн-билетов.',
  adminSearchTicketsPlaceholder: 'Поиск по PNR, пассажиру, телефону или рейсу...',
};

const en: TicketTranslationBlock = {
  tabTours: 'Tour Packages',
  tabFlights: 'Online Flight Tickets',
  badge: '5-Min Auto QR Payment & AI E-Ticket',
  title: 'Book flight tickets online',
  subtitle:
    'Pick a flight schedule, enter passenger details, complete the 5-minute QR payment, and let AI prepare your official verified boarding pass.',
  originLabel: 'From',
  destinationLabel: 'To',
  dateLabel: 'Departure Date',
  passengersLabel: 'Passengers',
  cabinLabel: 'Cabin',
  cabinEconomy: 'Economy',
  cabinBusiness: 'Business',
  directFlight: 'Direct flight',
  oneStop: '1 stop',
  baggageLabel: 'Baggage',
  selectFlightBtn: 'Select flight',
  selectedFlightBtn: 'Selected ✓',
  noFlightsFound: 'No flights found for this route.',
  perPassenger: 'per passenger',
  totalPriceLabel: 'Total price',
  passengerFormTitle: 'Passenger details',
  passengerFormSubtitle:
    'Proceeding opens a 5-minute QR payment window. Once paid, AI automatically prepares your official digital e-ticket.',
  passengerNameLabel: 'Passenger Full Name',
  passengerNamePlaceholder: 'e.g., Sardorbek Karimov',
  phoneLabel: 'Phone Number',
  phonePlaceholder: '+998 90 123 45 67',
  passportLabel: 'Passport / ID Number (optional)',
  passportPlaceholder: 'FA1234567',
  passportHint: 'Only the last 4 characters are shown on your pass for privacy.',
  issueBtn: 'Proceed to Payment (5:00)',
  issuingBtn: 'Creating 5-minute reservation...',
  validationError: 'Please enter a valid passenger name and phone number.',
  issueError: 'Could not process reservation. Please try again.',
  paymentStageBadge: '5-Minute Auto Payment Window',
  paymentTitle: 'Scan QR or confirm payment',
  paymentSubtitle:
    'Scan this payment QR with your phone or click Confirm Payment below. As soon as payment succeeds, AI prepares your official e-ticket.',
  paymentCountdownLabel: 'Time left',
  paymentScanHint: 'Scan with phone camera to pay immediately',
  paymentAmountLabel: 'Amount due',
  paymentConfirmBtn: 'Confirm Payment Automatically',
  paymentConfirmingBtn: 'Verifying payment...',
  paymentAiPreparing: 'Payment received! AI is preparing your official e-ticket...',
  paymentExpiredTitle: '5-minute payment window expired',
  paymentExpiredText: 'This hold timed out. Please submit again to generate a fresh payment QR.',
  paymentRetryBookingBtn: 'Reserve again',
  paymentAiRetryBtn: 'Retry AI ticket preparation',
  paymentCancelBtn: 'Go back',
  paymentPollingActive: 'Listening for mobile QR confirmation...',
  ticketIssuedTitle: 'Your official digital e-ticket is ready!',
  ticketIssuedSubtitle:
    'Payment verified and enriched with AI pre-flight instructions.',
  pnrLabel: 'Booking Code (PNR)',
  flightLabel: 'Flight',
  routeLabel: 'Route',
  passengerLabel: 'Passenger',
  passengersCountLabel: 'Passengers',
  totalPaidLabel: 'Total Paid',
  passportMaskLabel: 'Document',
  statusPendingPayment: 'Pending Payment',
  statusPaid: 'Paid',
  statusIssued: 'Ticket Issued',
  statusConfirmed: 'Confirmed',
  statusCancelled: 'Cancelled',
  statusExpired: 'Expired',
  aiBriefTitle: 'AI Flight Preparation Brief',
  aiCheckInLabel: 'Check-in',
  aiBaggageLabel: 'Baggage',
  aiArrivalLabel: 'Arrival Tip',
  qrVerifyNote: 'Scanning opens the official ticket verification page',
  printBtn: 'Print / Save PDF',
  copyBtn: 'Copy details',
  copiedBtn: 'Copied ✓',
  telegramBtn: 'Send via Telegram (@why_zuxaa)',
  telegramAppBtn: 'Open in Telegram App',
  telegramDraftHint:
    'Opens your ticket details pre-filled as a draft in our Telegram chat.',
  bookAnotherBtn: 'Book another ticket',
  openVerifyPageBtn: 'Open verification page',
  verifyPageTitle: 'Official E-Ticket Verification',
  verifyPageSubtitle: 'Authentic flight pass verified in the Horizo Tour booking registry',
  verifyAuthenticBadge: 'Authentic ticket verified',
  verifyNotFoundTitle: 'Ticket PNR not found',
  verifyNotFoundText: 'This booking code could not be found or has been removed.',
  verifyBackSiteBtn: 'Back to Horizo Tour',
  mobilePayTitle: 'Confirm Flight Ticket Payment',
  mobilePaySuccessTitle: 'Payment confirmed successfully!',
  mobilePaySuccessText: 'AI has prepared your official digital boarding pass.',
  adminTabInquiries: 'Tour Inquiries',
  adminTabTickets: 'Flight E-Tickets',
  adminStatTickets: 'E-Tickets',
  adminTicketsTitle: 'QR-Paid & AI-Prepared Flight E-Tickets',
  adminEmptyTickets: 'No online flight tickets yet.',
  adminSearchTicketsPlaceholder: 'Search by PNR, passenger, phone, or flight...',
};

const tr: TicketTranslationBlock = {
  ...en,
  tabTours: 'Tur Paketleri',
  tabFlights: 'Online Uçak Bileti',
  badge: '5 Dk Otomatik QR Ödeme & AI E-Bilet',
  issueBtn: 'Ödemeye Geç (5:00)',
  paymentTitle: 'QR ile ödemeyi onaylayın',
  paymentConfirmBtn: 'Ödemeyi Otomatik Onayla',
  paymentAiPreparing: 'Ödeme alındı! Yapay zeka biletinizi hazırlıyor...',
  ticketIssuedTitle: 'Resmi dijital e-biletiniz hazır!',
  aiBriefTitle: 'Yapay Zeka Uçuş Özeti',
  verifyPageTitle: 'Resmi E-Bilet Doğrulama',
  adminTabInquiries: 'Tur Talepleri',
  adminTabTickets: 'Uçak Biletleri',
  adminStatTickets: 'Uçak Bileti',
};

const ar: TicketTranslationBlock = {
  ...en,
  tabTours: 'الباقات السياحية',
  tabFlights: 'تذاكر الطيران أونلاين',
  badge: 'الدفع التلقائي عبر QR خلال 5 دقائق',
  issueBtn: 'الانتقال للدفع (5:00)',
  paymentConfirmBtn: 'تأكيد الدفع تلقائياً',
  ticketIssuedTitle: 'تذكرتك الإلكترونية الرسمية جاهزة!',
  verifyPageTitle: 'التحقق الرسمي من التذكرة',
  adminTabInquiries: 'طلبات الرحلات',
  adminTabTickets: 'تذاكر الطيران',
  adminStatTickets: 'التذاكر',
};

const th: TicketTranslationBlock = {
  ...en,
  tabTours: 'แพ็กเกจทัวร์',
  tabFlights: 'จองตั๋วเครื่องบินออนไลน์',
};

const vi: TicketTranslationBlock = {
  ...en,
  tabTours: 'Gói Tour',
  tabFlights: 'Vé máy bay trực tuyến',
};

const id: TicketTranslationBlock = {
  ...en,
  tabTours: 'Paket Tur',
  tabFlights: 'Tiket Pesawat Online',
};

const ms: TicketTranslationBlock = {
  ...id,
  tabTours: 'Pakej Pelancongan',
  tabFlights: 'Tiket Penerbangan Dalam Talian',
};

const zh: TicketTranslationBlock = {
  ...en,
  tabTours: '旅游套餐',
  tabFlights: '在线机票',
  issueBtn: '前往支付 (5:00)',
  paymentConfirmBtn: '自动确认支付',
  ticketIssuedTitle: '您的官方电子机票已生成！',
  verifyPageTitle: '官方电子机票验证',
  adminTabInquiries: '旅游咨询',
  adminTabTickets: '在线机票',
  adminStatTickets: '电子机票',
};

const ko: TicketTranslationBlock = {
  ...en,
  tabTours: '투어 패키지',
  tabFlights: '온라인 항공권',
  issueBtn: '결제 진행 (5:00)',
  paymentConfirmBtn: '결제 자동 확인',
  ticketIssuedTitle: '공식 전자항공권이 발급되었습니다!',
  verifyPageTitle: '공식 전자항공권 조회',
  adminTabInquiries: '투어 문의',
  adminTabTickets: '온라인 항공권',
  adminStatTickets: '항공권',
};

const dv: TicketTranslationBlock = {
  ...en,
};

export const TICKET_TRANSLATIONS: Record<Language, TicketTranslationBlock> = {
  uz,
  ru,
  en,
  tr,
  ar,
  th,
  vi,
  id,
  ms,
  zh,
  ko,
  dv,
};
