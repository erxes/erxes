import { i18nInstance } from './config';

export type AvailableLanguage = string;

export const useSwitchLanguage = () => {
  return {
    currentLanguage: i18nInstance.language,
    languages: i18nInstance.options.supportedLngs || [],
    switchLanguage: (languageId: AvailableLanguage) =>
      i18nInstance.changeLanguage(languageId),
  };
};
