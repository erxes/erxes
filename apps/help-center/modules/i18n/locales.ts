export const LOCALES = ['en', 'mn'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'hc.locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  mn: 'Монгол',
};

const INTL_TAGS: Record<Locale, string> = {
  en: 'en-GB',
  mn: 'mn-MN',
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export const intlTag = (locale: Locale): string => INTL_TAGS[locale];

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const storeLocale = (locale: Locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
};
