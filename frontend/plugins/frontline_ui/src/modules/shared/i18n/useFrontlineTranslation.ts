import { useTranslation } from 'react-i18next';
import en from './locales/en.json';
import mn from './locales/mn.json';

export const useFrontlineTranslation = (
  keyPrefix: string,
): ReturnType<typeof useTranslation> => {
  const translation = useTranslation('frontline', { keyPrefix });

  for (const [language, resources] of Object.entries({ en, mn })) {
    if (
      !translation.i18n.getResource(
        language,
        'frontline',
        'modules.ticket.ticket-name-required',
      )
    ) {
      translation.i18n.addResourceBundle(
        language,
        'frontline',
        resources,
        true,
      );
    }
  }

  return translation;
};
