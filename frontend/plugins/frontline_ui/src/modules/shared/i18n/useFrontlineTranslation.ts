import { useTranslation } from 'react-i18next';
import en from './locales/en.json';
import mn from './locales/mn.json';

export const useFrontlineTranslation = (
  keyPrefix: string,
): ReturnType<typeof useTranslation> => {
  const translation = useTranslation('frontline', { keyPrefix });

  for (const [language, resources] of Object.entries({ en, mn })) {
    const complete = Object.entries(resources.modules).every(
      ([module, labels]) =>
        Object.keys(labels).every((key) =>
          translation.i18n.getResource(
            language,
            'frontline',
            `modules.${module}.${key}`,
          ),
        ) !== undefined,
    );
    if (!complete) {
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
