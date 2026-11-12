import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enAutomations from './locales/en/automations.json';
import enCommon from './locales/en/common.json';
import enContact from './locales/en/contact.json';
import enOrganization from './locales/en/organization.json';
import enSettings from './locales/en/settings.json';
import mnAutomations from './locales/mn/automations.json';
import mnCommon from './locales/mn/common.json';
import mnContact from './locales/mn/contact.json';
import mnOrganization from './locales/mn/organization.json';
import mnSettings from './locales/mn/settings.json';

/*
 * erxes-ui and the components ported from old core-ui translate through
 * react-i18next, so core bundles the old gateway locales they use. Plugins
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
  // Old erxes namespaces, so ported components keep their useTranslation('contact'|…) calls.
  resources: {
    en: {
      common: enCommon,
      contact: enContact,
      settings: enSettings,
      organization: enOrganization,
      automations: enAutomations,
    },
    mn: {
      common: mnCommon,
      contact: mnContact,
      settings: mnSettings,
      organization: mnOrganization,
      automations: mnAutomations,
    },
  },
  lng: savedLanguage(),
  fallbackLng: 'en',
  ns: ['common', 'contact', 'settings', 'organization', 'automations'],
  defaultNS: 'common',
  fallbackNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on('languageChanged', (language) => localStorage.setItem(LANGUAGE_KEY, language));

export { i18n };
