import {LocalizedText} from './tours';

export interface TeamMember {
  id: string;
  name: string;
  role: LocalizedText;
  image: string;
}

export const FOUNDER: TeamMember = {
  id: 'founder',
  name: 'Zuhriddin',
  role: {
    uz: 'Asoschi va rahbar',
    ru: 'Основатель и руководитель',
    en: 'Founder & Managing Director',
    tr: 'Kurucu ve Yönetici',
    ar: 'المؤسس والمدير التنفيذي',
    th: 'ผู้ก่อตั้งและผู้อำนวยการ',
    vi: 'Nhà sáng lập & Giám đốc',
    id: 'Pendiri & Direktur',
    ms: 'Pengasas & Pengarah',
    zh: '创始人兼总经理',
    ko: '설립자 및 대표',
    dv: 'ބާނީ އަދި ޑިރެކްޓަރ',
  },
  image: '/src/assets/images/portrait_founder_1795353460423.jpg',
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'zuhriddin',
    name: 'Zuhriddin',
    role: FOUNDER.role,
    image: '/src/assets/images/portrait_founder_1795353460423.jpg',
  },
  {
    id: 'madina',
    name: 'Madina',
    role: {
      uz: 'Katta tur menejer',
      ru: 'Старший тур-менеджер',
      en: 'Senior Tour Manager',
      tr: 'Kıdemli Tur Yöneticisi',
      ar: 'مديرة رحلات أولى',
      th: 'ผู้จัดการทัวร์อาวุโส',
      vi: 'Quản lý tour cấp cao',
      id: 'Manajer Tur Senior',
      ms: 'Pengurus Pelancongan Kanan',
      zh: '高级旅游经理',
      ko: '수석 투어 매니저',
      dv: 'ސީނިއަރ ޓުއަރ މެނޭޖަރ',
    },
    image: '/src/assets/images/portrait_staff_female_1795353459998.jpg',
  },
  {
    id: 'azizbek',
    name: 'Azizbek',
    role: {
      uz: 'Aviachipta va transfer mutaxassisi',
      ru: 'Специалист по авиабилетам',
      en: 'Flights & Transfers Specialist',
      tr: 'Uçuş ve Transfer Uzmanı',
      ar: 'أخصائي الطيران والنقل',
      th: 'ผู้เชี่ยวชาญเที่ยวบินและรับส่ง',
      vi: 'Chuyên viên vé bay & vận chuyển',
      id: 'Spesialis Penerbangan & Transfer',
      ms: 'Pakar Penerbangan & Pengangkutan',
      zh: '机票与接送专员',
      ko: '항공 및 트랜스퍼 전문가',
      dv: 'ފްލައިޓްސް އަދި ޓްރާންސްފަރ ސްޕެޝަލިސްޓް',
    },
    image: '/src/assets/images/portrait_staff_male_1795353537283.jpg',
  },
  {
    id: 'nilufar',
    name: 'Nilufar',
    role: {
      uz: "Viza va hujjatlar bo'yicha maslahatchi",
      ru: 'Консультант по визам и документам',
      en: 'Visa & Documentation Advisor',
      tr: 'Vize ve Evrak Danışmanı',
      ar: 'مستشارة التأشيرات والوثائق',
      th: 'ที่ปรึกษาวีซ่าและเอกสาร',
      vi: 'Tư vấn viên Visa & Hồ sơ',
      id: 'Konsultan Visa & Dokumen',
      ms: 'Penasihat Visa & Dokumen',
      zh: '签证与证件顾问',
      ko: '비자 및 서류 컨설턴트',
      dv: 'ވިސާ އަދި ޑޮކިއުމެންޓޭޝަން އެޑްވައިޒަރ',
    },
    image: '/src/assets/images/portrait_traveler_1795353460620.jpg',
  },
  {
    id: 'sardor',
    name: 'Sardor',
    role: {
      uz: 'Kurort va mehmonxonalar mutaxassisi',
      ru: 'Специалист по отелям и курортам',
      en: 'Hotels & Resorts Specialist',
      tr: 'Otel ve Tatil Köyü Uzmanı',
      ar: 'أخصائي الفنادق والمنتجعات',
      th: 'ผู้เชี่ยวชาญโรงแรมและรีสอร์ต',
      vi: 'Chuyên viên khách sạn & nghỉ dưỡng',
      id: 'Spesialis Hotel & Resor',
      ms: 'Pakar Hotel & Resort',
      zh: '酒店与度假村专员',
      ko: '호텔 및 리조트 전문가',
      dv: 'ހޮޓެލްސް އަދި ރިސޯޓް ސްޕެޝަލިސްޓް',
    },
    image: '/src/assets/images/team_office_group_1795353461320.jpg',
  },
];
