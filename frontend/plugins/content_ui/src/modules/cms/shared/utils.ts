export const getTranslation = <T extends { language: string }>(
  translations: T[] | undefined,
  language: string | undefined,
): T | undefined => {
  if (!translations || !language || language.trim() === '') return undefined;
  return translations.find((t) => t.language === language);
};
