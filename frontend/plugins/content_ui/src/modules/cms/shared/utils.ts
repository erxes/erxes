/**
 * Finds a translation entry for a specific language from a list of translations.
 * @param translations - The list of translation entries.
 * @param language - The language code to find.
 * @returns The matching translation entry or undefined.
 */
export const getTranslation = <T extends { language: string }>(
  translations: T[] | undefined,
  language: string | undefined,
): T | undefined => {
  if (!translations || !language || language.trim() === '') return undefined;
  return translations.find((t) => t.language === language);
};
