import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import enAutomations from './locales/en/automations.json';
import enCommon from './locales/en/common.json';
import enContact from './locales/en/contact.json';
import enOrganization from './locales/en/organization.json';
import enProduct from './locales/en/product.json';
import enSettings from './locales/en/settings.json';
import enViews from './locales/en/views.json';

/*
 * erxes-ui and core's components translate through react-i18next. English is
 * bundled, as the fallback every string ends at; another language's locales
 * load as their own chunks when it is chosen, so no route carries them for
 * members who read English. Plugins share this instance through Module
 * Federation and add their own namespaces.
 */
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'mn', label: 'Монгол' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const LANGUAGE_KEY = 'lng';

const savedLanguage = (): LanguageCode => {
  const saved = localStorage.getItem(LANGUAGE_KEY);

  return LANGUAGES.find((language) => language.code === saved)?.code ?? 'en';
};

const i18n = createInstance();

/** Resolves once the saved language's locales are in, so the first render is in that language. */
export const i18nReady = i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, ns: string) => import(`./locales/${language}/${ns}.json`),
    ),
  )
  .init({
    // One namespace per area, as components name it in useTranslation('contact'|…).
    resources: {
      en: {
        common: enCommon,
        contact: enContact,
        settings: enSettings,
        organization: enOrganization,
        automations: enAutomations,
        product: enProduct,
        views: enViews,
      },
    },
    partialBundledLanguages: true,
    lng: savedLanguage(),
    fallbackLng: 'en',
    ns: ['common', 'contact', 'settings', 'organization', 'automations', 'product', 'views'],
    defaultNS: 'common',
    fallbackNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

// Screen readers pick their voice from <html lang>.
document.documentElement.lang = i18n.language;

i18n.on('languageChanged', (language) => {
  localStorage.setItem(LANGUAGE_KEY, language);
  document.documentElement.lang = language;
});

export { i18n };
