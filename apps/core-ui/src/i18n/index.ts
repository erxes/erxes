import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import mnCommon from './locales/mn/common.json';

/*
 * erxes-ui components translate through react-i18next ("common" namespace),
 * so core bundles the shared strings from the old gateway locales. Plugins
 * share this instance through Module Federation and add their own namespaces.
 */
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'mn', label: 'Монгол' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const LANGUAGE_KEY = 'lng';

const savedLanguage = (): LanguageCode => {
  const saved = localStorage.getItem(LANGUAGE_KEY);

  return LANGUAGES.some((language) => language.code === saved) ? (saved as LanguageCode) : 'en';
};

void i18n.use(initReactI18next).init({
  resources: { en: { common: enCommon }, mn: { common: mnCommon } },
  lng: savedLanguage(),
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  fallbackNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on('languageChanged', (language) => localStorage.setItem(LANGUAGE_KEY, language));

export { i18n };
