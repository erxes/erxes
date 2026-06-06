import { initReactI18next } from 'react-i18next';
import i18n, { InitOptions } from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { REACT_APP_API_URL } from 'erxes-ui';

const supportedLngs = ['en', 'mn'];

export const defaultI18nOptions: InitOptions = {
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  supportedLngs,
  backend: {
    loadPath: `${REACT_APP_API_URL}/locales/{{lng}}/{{ns}}.json`,
  },
  ns: ['common', 'contact', 'product', 'documents', 'organization', 'segment', 'automations', 'settings', 'broadcasts'],
  defaultNS: 'common',
  fallbackNS: ['common'],
  react: {
    useSuspense: true,
  },
};

export const i18nInstance = i18n.createInstance();

i18nInstance.on('languageChanged', (lng) => {
  localStorage.setItem('lng', lng);
});

const savedLanguage = localStorage.getItem('lng');
const lng =
  savedLanguage && supportedLngs.includes(savedLanguage)
    ? savedLanguage
    : 'en';

i18nInstance
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    ...defaultI18nOptions,
    lng,
  });
