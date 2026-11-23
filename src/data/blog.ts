import type {Language} from '../i18n/languages';
import {LocalizedText} from './tours';

export interface BlogArticle {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  date: LocalizedText;
  readTime: LocalizedText;
  category: LocalizedText;
  image: string;
  paragraphs: Record<Language, string[]>;
}

const baliUz = [
  "Bali tropik iqlimga ega bo'lib, yil davomida iliq havo saqlanib turadi. Biroq sayohat rejalashtirishda oroldagi ikki asosiy mavsumni hisobga olish foydali: quruq mavsum (maydan oktyabrgacha) va namgarchilik ko'proq bo'ladigan mavsum (noyabrdan aprelgacha).",
  "May–sentyabr oylari quyoshli kunlar ko'pligi, okean suvi tiniqroq bo'lishi va Ubud sholi terrasalari hamda tog'li hududlarga sayohat qilish qulayligi bilan ajralib turadi.",
  "Qishki va bahorgi oylarda esa havo hamon iliq bo'ladi, qisqa muddatli tropik yomg'irlar odatda kechki yoki tungi soatlarda yog'adi. Menejerlarimiz sizga eng mos hudud va sanalarni tanlashda yordam beradi.",
];

const baliRu = [
  'Бали отличается тёплым тропическим климатом круглый год, но при планировании поездки удобно учитывать два сезона: сухой (с мая по октябрь) и более влажный (с ноября по апрель).',
  'С мая по сентябрь преобладают солнечные дни, меньше влажность и спокойнее погода для экскурсий в Убуд, к водопадам и рисовым террасам.',
  'С ноября по апрель на острове по-прежнему тепло, а кратковременные тропические дожди чаще проходят вечером или ночью. Наши менеджеры помогут подобрать подходящее побережье и даты.',
];

const baliEn = [
  'Bali enjoys warm tropical weather year-round, shaped by two main seasons: the dry season (May–October) and the greener rainy season (November–April).',
  'Between May and September, clear sunny skies and calm ocean conditions make island touring, Ubud rice terraces, and beach days especially comfortable.',
  'Even from November through April, daytime warmth remains inviting with brief tropical showers mostly passing in the evening. Our specialists help pick the ideal coast for your dates.',
];

const dubaiUz = [
  "Dubaiga sayohat qilish uchun eng yoqimli ob-havo oktyabrdan aprelgacha kuzatiladi. Bu oylarda kunduzgi harorat sayr qilish va plyajda dam olish uchun qulay bo'ladi.",
  "Shahar jamoat joylarida va savdo markazlarida qulay hamda kamtarona kiyinish tavsiya etiladi, plyaj va basseyn hududlarida esa odatiy dam olish kiyimlari mos keladi.",
  "Sayohatdan oldin xorijga chiqish pasportining amal qilish muddati kamida 6 oy ekanligini tekshirish kifoya. Horizo Tour jamoasi barcha bosqichlarda hamrohlik qiladi.",
];

const dubaiRu = [
  'Наиболее комфортная погода для прогулок и пляжного отдыха в Дубае держится с октября по апрель. В летние месяцы акцент делают на отелях с охлаждаемыми бассейнами.',
  'В торговых центрах и общественных местах стоит выбирать аккуратную повседневную одежду, а из-за активных кондиционеров пригодится лёгкая накидка.',
  'Перед вылетом важно проверить срок действия загранпаспорта (не менее 6 месяцев) и детали трансфера. Команда Horizo Tour сопровождает вас на каждом этапе.',
];

const dubaiEn = [
  'October through April brings Dubai’s most pleasant outdoor weather—ideal for beach lounging, desert safaris, and evening waterfront walks.',
  'Smart-casual clothing suits malls and dining venues comfortably, while bringing a light layer helps indoors where air conditioning is crisp.',
  'Before flying, ensure your passport is valid for at least six months; Horizo Tour arranges flights, transfers, and travel support seamlessly.',
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'bali-qachon-borish-yaxshi',
    title: {
      uz: 'Bali: qachon borish yaxshi?',
      ru: 'Бали: когда лучше ехать?',
      en: 'Bali: When is the Best Time to Visit?',
      tr: 'Bali: Ne Zaman Gitmeli?',
      ar: 'بالي: متى يكون الوقت الأنسب للزيارة؟',
      th: 'บาหลี: ควรไปเที่ยวช่วงไหนดีที่สุด?',
      vi: 'Bali: Thời điểm nào đẹp nhất để đi?',
      id: 'Bali: Kapan Waktu Terbaik Berkunjung?',
      ms: 'Bali: Bilakah Masa Terbaik Melawat?',
      zh: '巴厘岛：几月去最合适？',
      ko: '발리: 언제 여행하는 것이 가장 좋을까요?',
      dv: 'ބާލީ: ދަތުރުކުރަން އެންމެ ރަނގަޅީ ކޮން ދުވަސްވަރެއް؟',
    },
    excerpt: {
      uz: "Balining quruq va yomg'irli mavsumlari, plyajlar va ekskursiyalar uchun eng qulay oylar haqida qisqacha qo'llanma.",
      ru: 'Краткий гид по сухому и влажному сезонам на Бали и выбору лучшего времени для пляжа и экскурсий.',
      en: "A quick guide to Bali's dry and green seasons and choosing the ideal months for beaches and excursions.",
      tr: "Bali'nin kuru ve yağışlı mevsimleri ile plaj ve turlar için en uygun aylar hakkında kısa rehber.",
      ar: 'دليل موجز لمواسم بالي الجافة والممطرة واختيار الأشهر الأنسب للشواطئ والرحلات.',
      th: 'คู่มือสั้นๆ เกี่ยวกับฤดูแล้งและฤดูฝนของบาหลี พร้อมแนะนำเดือนที่เหมาะที่สุด',
      vi: 'Cẩm nang ngắn gọn về hai mùa ở Bali để chọn tháng lý tưởng cho tắm biển và tham quan.',
      id: 'Panduan singkat musim kemarau dan penghujan di Bali serta bulan terbaik untuk liburan.',
      ms: 'Panduan ringkas musim kering dan hujan di Bali serta bulan terbaik untuk bercuti.',
      zh: '一份关于巴厘岛旱季与雨季的简明指南，助您挑选最佳海滩与观光月份。',
      ko: '발리의 건기와 우기, 해변과 투어에 가장 좋은 시기를 안내하는 실용 가이드.',
      dv: 'ބާލީގެ މޫސުންތަކާއި ގޮނޑުދޮށަށް އެންމެ ރަނގަޅު މަސްތަކުގެ ކުރު ގައިޑެއް.',
    },
    date: {
      uz: '12 Mart, 2026',
      ru: '12 марта, 2026',
      en: 'March 12, 2026',
      tr: '12 Mart 2026',
      ar: '12 مارس 2026',
      th: '12 มีนาคม 2026',
      vi: '12 Tháng 3, 2026',
      id: '12 Maret 2026',
      ms: '12 Mac 2026',
      zh: '2026年3月12日',
      ko: '2026년 3월 12일',
      dv: '12 މާރިޗު 2026',
    },
    readTime: {
      uz: '3 daqiqa',
      ru: '3 мин чтения',
      en: '3 min read',
      tr: '3 dk okuma',
      ar: '3 دقائق قراءة',
      th: 'อ่าน 3 นาที',
      vi: '3 phút đọc',
      id: '3 mnt baca',
      ms: '3 min baca',
      zh: '阅读约 3 分钟',
      ko: '3분 소요',
      dv: '3 މިނެޓު',
    },
    category: {
      uz: 'Mavsum tanlash',
      ru: 'Выбор сезона',
      en: 'Season Guide',
      tr: 'Sezon Rehberi',
      ar: 'دليل المواسم',
      th: 'คู่มือฤดูกาล',
      vi: 'Chọn mùa đẹp',
      id: 'Panduan Musim',
      ms: 'Panduan Musim',
      zh: '季节指南',
      ko: '시즌 가이드',
      dv: 'މޫސުން',
    },
    image: '/src/assets/images/dest_bali_1795353535955.jpg',
    paragraphs: {
      uz: baliUz,
      ru: baliRu,
      en: baliEn,
      tr: [
        'Bali yıl boyunca sıcak tropikal iklime sahiptir; planlama yaparken kuru sezon (Mayıs–Ekim) ve yeşil sezon (Kasım–Nisan) dikkate alınır.',
        'Mayıs ve Eylül arası güneşli günlerin çokluğu ve sakin okyanus sayesinde Ubud terasları ve plajlar için en ideal dönemdir.',
        'Kış aylarında ise tropikal yağmurlar genellikle kısa sürer; uzmanlarımız tarihlerinize en uygun bölgeyi seçmenize yardımcı olur.',
      ],
      ar: [
        'تتمتع بالي بمناخ استوائي دافئ طوال العام، وينقسم إلى موسم جاف (مايو–أكتوبر) وموسم أكثر رطوبة (نوفمبر–أبريل).',
        'تُعد الفترة من مايو إلى سبتمبر مثالية لأشعة الشمس الصافية والرحلات إلى أوبود والشلالات.',
        'حتى في الشتاء تظل الأجواء دافئة مع أمطار استوائية قصيرة غالباً في المساء.',
      ],
      th: [
        'บาหลีมีอากาศอบอุ่นตลอดปี แบ่งเป็นฤดูแล้ง (พ.ค.–ต.ค.) และฤดูฝน (พ.ย.–เม.ย.)',
        'ช่วงเดือนพฤษภาคมถึงกันยายนแดดสวย น้ำใส เหมาะกับการเที่ยวอูบุดและพักผ่อนริมชายหาดมากที่สุด',
        'ช่วงปลายปีถึงต้นปีอากาศยังคงอบอุ่น ฝนตกเพียงช่วงสั้นๆ ตอนเย็น ทีมงานช่วยเลือกหาดที่เหมาะกับคุณได้',
      ],
      vi: [
        'Bali ấm áp quanh năm với hai mùa rõ rệt: mùa khô (tháng 5–10) và mùa mưa (tháng 11–4).',
        'Từ tháng 5 đến tháng 9 trời nắng đẹp, biển êm, rất thích hợp khám phá ruộng bậc thang Ubud và tắm biển.',
        'Từ tháng 11 đến tháng 4 các cơn mưa nhiệt đới thường ngắn vào chiều tối; đội ngũ sẽ gợi ý khu vực phù hợp nhất.',
      ],
      id: [
        'Bali beriklim tropis hangat sepanjang tahun dengan dua musim utama: kemarau (Mei–Oktober) dan musim hujan (November–April).',
        'Mei hingga September menawarkan langit cerah dan laut tenang yang sempurna untuk wisata Ubud dan pantai.',
        'Pada November hingga April, hujan tropis umumnya singkat di malam hari; tim kami siap memilihkan area terbaik.',
      ],
      ms: [
        'Bali beriklim tropika hangat sepanjang tahun dengan musim kering (Mei–Oktober) dan musim hujan (November–April).',
        'Mei hingga September sangat sesuai untuk menikmati cahaya matahari cerah di pantai dan teres padi Ubud.',
        'Hujan pada hujung tahun biasanya singkat di waktu malam; pasukan kami sedia memilih lokasi terbaik untuk anda.',
      ],
      zh: [
        '巴厘岛全年温暖宜人，主要分为旱季（5月至10月）与雨季（11月至次年4月）。',
        '5月至9月阳光充足、海水清澈，最适合前往乌布梯田观光与海滨度假。',
        '11月至次年4月白天气温依然舒适，阵雨多集中在傍晚；我们的顾问将为您匹配最合适的海岸与酒店。',
      ],
      ko: [
        '발리는 연중 따뜻한 열대 기후로 건기(5~10월)와 우기(11~4월)로 나뉩니다.',
        '5월부터 9월까지는 화창하고 습도가 낮아 우붓 투어와 해변 휴양 모두에 가장 좋습니다.',
        '겨울철에도 낮에는 따뜻하며 스콜이 짧게 지나가므로 일정에 맞춰 알맞은 해변 지역을 추천해 드립니다.',
      ],
      dv: baliEn,
    },
  },
  {
    slug: 'dubaiga-sayohat-uchun-nimalar-kerak',
    title: {
      uz: 'Dubaiga sayohat uchun nimalarni bilish kerak',
      ru: 'Что нужно знать перед поездкой в Дубай',
      en: 'Essential Tips Before Visiting Dubai',
      tr: 'Dubai Seyahati Öncesi Bilmeniz Gerekenler',
      ar: 'أهم النصائح قبل السفر إلى دبي',
      th: 'สิ่งที่ควรรู้ก่อนเดินทางไปดูไบ',
      vi: 'Những điều cần biết trước khi đi Dubai',
      id: 'Hal Penting Sebelum Berlibur ke Dubai',
      ms: 'Perkara Penting Sebelum Bercuti ke Dubai',
      zh: '去迪拜旅行前需要了解的实用贴士',
      ko: '두바이 여행 전 꼭 알아야 할 핵심 팁',
      dv: 'ދުބާއީއަށް ދިއުމުގެ ކުރިން އެނގެންޖެހޭ މުހިންމު ކަންކަން',
    },
    excerpt: {
      uz: "Ob-havo, kiyinish madaniyati, transport va hujjatlar bo'yicha Dubaiga ilk bor borayotganlar uchun foydali maslahatlar.",
      ru: 'Полезные советы для первой поездки в Дубай: погода, дресс-код, транспорт и подготовка документов.',
      en: 'Helpful pointers for first-time Dubai travelers covering weather, dress etiquette, transport, and passport checks.',
      tr: 'Dubai’ye ilk kez gidecekler için hava durumu, giyim kuralları, ulaşım ve evrak önerileri.',
      ar: 'نصائح مفيدة لزوار دبي لأول مرة حول الطقس والملابس والمواصلات والوثائق.',
      th: 'เคล็ดลับสำหรับผู้เดินทางไปดูไบครั้งแรก ทั้งสภาพอากาศ การแต่งกาย และเอกสาร',
      vi: 'Lời khuyên hữu ích cho lần đầu đến Dubai về thời tiết, trang phục, di chuyển và hộ chiếu.',
      id: 'Tips praktis perjalanan pertama ke Dubai: cuaca, etika berbusana, transportasi, dan dokumen.',
      ms: 'Tip berguna untuk perjalanan pertama ke Dubai: cuaca, etika pakaian, pengangkutan dan dokumen.',
      zh: '为首次前往迪拜的旅客整理的天气、着装礼仪、交通及护照实用建议。',
      ko: '첫 두바이 여행자를 위한 날씨, 복장 에티켓, 교통 및 여권 체크리스트 안내.',
      dv: 'ދުބާއީއަށް ފުރަތަމަ ފަހަރަށް ދާ ފަރާތްތަކަށް މޫސުމާއި، ހެދުން އެޅުމާއި ލިޔެކިޔުމުގެ މަޢުލޫމާތު.',
    },
    date: {
      uz: '28 Fevral, 2026',
      ru: '28 февраля, 2026',
      en: 'February 28, 2026',
      tr: '28 Şubat 2026',
      ar: '28 فبراير 2026',
      th: '28 กุมภาพันธ์ 2026',
      vi: '28 Tháng 2, 2026',
      id: '28 Februari 2026',
      ms: '28 Februari 2026',
      zh: '2026年2月28日',
      ko: '2026년 2월 28일',
      dv: '28 ފެބްރުއަރީ 2026',
    },
    readTime: {
      uz: '4 daqiqa',
      ru: '4 мин чтения',
      en: '4 min read',
      tr: '4 dk okuma',
      ar: '4 دقائق قراءة',
      th: 'อ่าน 4 นาที',
      vi: '4 phút đọc',
      id: '4 mnt baca',
      ms: '4 min baca',
      zh: '阅读约 4 分钟',
      ko: '4분 소요',
      dv: '4 މިނެޓު',
    },
    category: {
      uz: 'Sayohat maslahatlari',
      ru: 'Советы',
      en: 'Travel Tips',
      tr: 'Seyahat İpuçları',
      ar: 'نصائح السفر',
      th: 'เคล็ดลับเดินทาง',
      vi: 'Mẹo du lịch',
      id: 'Tips Wisata',
      ms: 'Tip Pelancongan',
      zh: '出行攻略',
      ko: '여행 팁',
      dv: 'ދަތުރުގެ އިރުޝާދު',
    },
    image: '/src/assets/images/dest_dubai_1795353537115.jpg',
    paragraphs: {
      uz: dubaiUz,
      ru: dubaiRu,
      en: dubaiEn,
      tr: [
        'Dubai’de açık hava gezileri ve plaj keyfi için en rahat dönem Ekim–Nisan ayları arasıdır.',
        'Alışveriş merkezlerinde ve kamusal alanlarda rahat ve özenli kıyafetler tercih edilir; klimalı mekanlar için ince bir üstlük faydalı olur.',
        'Uçuş öncesi pasaport geçerliliğinin en az 6 ay olmasını kontrol etmek yeterlidir; Horizo Tour tüm süreçte yanınızdadır.',
      ],
      ar: [
        'أفضل طقس للتنزه والاستمتاع بالشواطئ في دبي يكون بين أكتوبر وأبريل.',
        'يُنصح بارتداء ملابس مريحة ومحتشمة في المراكز التجارية، مع سترة خفيفة بسبب التكييف الداخلي.',
        'تأكد من صلاحية جواز السفر لمدة لا تقل عن 6 أشهر؛ وسيتولى فريق Horizo Tour كافة الترتيبات.',
      ],
      th: [
        'ช่วงเดือนตุลาคมถึงเมษายนมีอากาศเย็นสบาย เหมาะกับการเดินเที่ยวและพักผ่อนริมหาดในดูไบ',
        'ควรเลือกแต่งกายสุภาพสบายๆ ในห้างสรรพสินค้า และพกเสื้อคลุมบางๆ สำหรับห้องแอร์',
        'ตรวจสอบอายุพาสปอร์ตให้เหลืออย่างน้อย 6 เดือนก่อนเดินทาง แล้วปล่อยให้ Horizo Tour ดูแลเรื่องตั๋วและรถรับส่ง',
      ],
      vi: [
        'Tháng 10 đến tháng 4 là khoảng thời gian dễ chịu nhất để dạo chơi và tắm biển tại Dubai.',
        'Tại trung tâm thương mại nên chọn trang phục lịch sự, thoải mái và mang theo áo khoác mỏng vì điều hòa khá mát.',
        'Đừng quên kiểm tra hộ chiếu còn hạn ít nhất 6 tháng; Horizo Tour luôn đồng hành hỗ trợ suốt hành trình.',
      ],
      id: [
        'Cuaca paling nyaman untuk berkeliling dan bersantai di pantai Dubai berlangsung dari Oktober hingga April.',
        'Kenakan pakaian kasual yang rapi di pusat perbelanjaan, dan siapkan jaket tipis untuk ruangan ber-AC.',
        'Pastikan paspor berlaku minimal 6 bulan sebelum berangkat; tim Horizo Tour mendampingi setiap langkah.',
      ],
      ms: [
        'Cuaca paling nyaman di Dubai ialah antara Oktober hingga April, sesuai untuk bersiar-siar dan aktiviti pantai.',
        'Pakai pakaian sopan dan selesa di pusat beli-belah serta bawa baju luar ringan kerana pendingin hawa yang kuat.',
        'Pastikan pasport sah sekurang-kurangnya 6 bulan sebelum penerbangan; Horizo Tour menguruskan segalanya untuk anda.',
      ],
      zh: [
        '每年 10 月至次年 4 月是迪拜气候最舒适的季节，非常适合海滩度假与户外游览。',
        '在商场和公共场所建议穿着得体舒适，因室内冷气较足，可随身携带一件轻薄外套。',
        '出发前请确认护照有效期不少于 6 个月，Horizo Tour 将全程协助机票、酒店与接送安排。',
      ],
      ko: [
        '두바이는 10월부터 4월까지 야외 관광과 해변 휴양을 즐기기에 가장 쾌적합니다.',
        '쇼핑몰과 공공장소에서는 단정하고 편한 복장을 권하며 실내 냉방에 대비해 얇은 겉옷을 챙기면 좋습니다.',
        '출발 전 여권 유효기간이 6개월 이상 남았는지 확인하세요. Horizo Tour가 항공과 픽업을 꼼꼼히 챙겨드립니다.',
      ],
      dv: dubaiEn,
    },
  },
];

export function getBlogBySlug(slug: string | undefined): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}
