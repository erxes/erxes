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
  detection: {
    caches: ['cookie', 'localStorage', 'header'],
    lookupCookie: 'lng',
    lookupLocalStorage: 'lng',
    order: ['cookie', 'localStorage', 'header'],
  },
  backend: {
    loadPath: `${REACT_APP_API_URL}/locales/{{lng}}.json`,
  },
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
    : String(defaultI18nOptions.fallbackLng); // Ensure fallback is a string

i18nInstance
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    ...defaultI18nOptions,
    lng: lng as string | undefined,
  });
