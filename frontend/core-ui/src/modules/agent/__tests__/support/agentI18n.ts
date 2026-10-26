import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

export type TAgentLocale = 'en' | 'mn';

/** The shipped `common` namespace for a locale (served by the gateway). */
export const readCommonLocale = (
  locale: TAgentLocale,
): { agent: Record<string, unknown> } =>
  JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '../../../../../../../backend/gateway/src/locales',
        locale,
        'common.json',
      ),
      'utf8',
    ),
  );

/**
 * A real i18next instance with the shipped locale files, registered with
 * react-i18next so components translate exactly as in the app.
 */
export const initAgentI18n = (lng: TAgentLocale) => {
  const instance = createInstance();
  void instance.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    resources: {
      en: { common: readCommonLocale('en') },
      mn: { common: readCommonLocale('mn') },
    },
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
  return instance;
};
