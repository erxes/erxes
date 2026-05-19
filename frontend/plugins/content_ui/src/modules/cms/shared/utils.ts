export const getTranslation = <T extends { language: string }>(
  translations: T[] | undefined,
  language: string | undefined,
): T | undefined => {
  if (!translations || !language) return undefined;
  return translations.find((t) => t.language === language);
};
