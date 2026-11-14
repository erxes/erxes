import { createInstance } from 'i18next';
import { LANGUAGES, stored } from 'erxes-ui';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getDefaultStore } from 'jotai';
import { initReactI18next } from 'react-i18next';
import { z } from 'zod';
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
 * Federation and add their own namespaces. The languages are erxes-ui's
 * LANGUAGES, which also pick the date format.
 */

const LanguageCode = z.literal(LANGUAGES.map(({ code }) => code));

/** The language picked in this browser, read before the first render. */
const languageState = stored({ key: 'erxes:ui:language', schema: LanguageCode, initial: 'en' });
const store = getDefaultStore();

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
    lng: store.get(languageState),
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
  const code = LanguageCode.safeParse(language);

  if (code.success) store.set(languageState, code.data);
  document.documentElement.lang = language;
});

export { i18n };
