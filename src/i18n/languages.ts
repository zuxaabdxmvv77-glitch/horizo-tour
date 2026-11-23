export type Language =
  | 'uz'
  | 'ru'
  | 'en'
  | 'tr'
  | 'ar'
  | 'th'
  | 'vi'
  | 'id'
  | 'ms'
  | 'zh'
  | 'ko'
  | 'dv';

export interface LanguageMeta {
  code: Language;
  shortCode: string;
  nativeName: string;
  countryHint: string;
  dir: 'ltr' | 'rtl';
  intlLocale: string;
}

export const SUPPORTED_LANGUAGES: readonly LanguageMeta[] = [
  {
    code: 'uz',
    shortCode: 'UZ',
    nativeName: "O'zbekcha",
    countryHint: "O'zbekiston",
    dir: 'ltr',
    intlLocale: 'uz-UZ',
  },
  {
    code: 'ru',
    shortCode: 'RU',
    nativeName: 'Русский',
    countryHint: 'Россия / СНГ',
    dir: 'ltr',
    intlLocale: 'ru-RU',
  },
  {
    code: 'en',
    shortCode: 'EN',
    nativeName: 'English',
    countryHint: 'International',
    dir: 'ltr',
    intlLocale: 'en-US',
  },
  {
    code: 'tr',
    shortCode: 'TR',
    nativeName: 'Türkçe',
    countryHint: 'Türkiye',
    dir: 'ltr',
    intlLocale: 'tr-TR',
  },
  {
    code: 'ar',
    shortCode: 'AR',
    nativeName: 'العربية',
    countryHint: 'الإمارات ومصر',
    dir: 'rtl',
    intlLocale: 'ar-AE',
  },
  {
    code: 'th',
    shortCode: 'TH',
    nativeName: 'ไทย',
    countryHint: 'ประเทศไทย',
    dir: 'ltr',
    intlLocale: 'th-TH',
  },
  {
    code: 'vi',
    shortCode: 'VI',
    nativeName: 'Tiếng Việt',
    countryHint: 'Việt Nam',
    dir: 'ltr',
    intlLocale: 'vi-VN',
  },
  {
    code: 'id',
    shortCode: 'ID',
    nativeName: 'Bahasa Indonesia',
    countryHint: 'Indonesia (Bali)',
    dir: 'ltr',
    intlLocale: 'id-ID',
  },
  {
    code: 'ms',
    shortCode: 'MS',
    nativeName: 'Bahasa Melayu',
    countryHint: 'Malaysia',
    dir: 'ltr',
    intlLocale: 'ms-MY',
  },
  {
    code: 'zh',
    shortCode: 'ZH',
    nativeName: '中文',
    countryHint: '中国 (海南)',
    dir: 'ltr',
    intlLocale: 'zh-CN',
  },
  {
    code: 'ko',
    shortCode: 'KO',
    nativeName: '한국어',
    countryHint: '대한민국',
    dir: 'ltr',
    intlLocale: 'ko-KR',
  },
  {
    code: 'dv',
    shortCode: 'DV',
    nativeName: 'ދިވެހި',
    countryHint: 'ދިވެހިރާއްޖެ (Maldives)',
    dir: 'rtl',
    intlLocale: 'dv-MV',
  },
] as const;

export const VALID_LANGUAGE_CODES: ReadonlySet<string> = new Set(
  SUPPORTED_LANGUAGES.map((l) => l.code),
);

export function isValidLanguage(value: unknown): value is Language {
  return typeof value === 'string' && VALID_LANGUAGE_CODES.has(value);
}

export function getLanguageMeta(code: Language): LanguageMeta {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}
