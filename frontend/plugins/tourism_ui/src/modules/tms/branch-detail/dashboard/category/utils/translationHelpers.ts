import { ICategoryTranslationInput } from '../hooks/useCreateCategory';
import { CategoryCreateFormType } from '../constants/formSchema';
import { ICategory } from '../types/category';

export const buildEmptyCategoryTranslations = (
  translationLanguages: string[],
): CategoryCreateFormType['translations'] =>
  translationLanguages.map((lang) => ({
    language: lang,
    name: '',
  }));

export const buildTranslationsFromCategory = (
  category: ICategory,
  translationLanguages: string[],
): CategoryCreateFormType['translations'] =>
  translationLanguages.map((lang) => {
    const existing = (category.translations || []).find(
      (t) => t.language === lang,
    );
    return {
      language: lang,
      name: existing?.name || '',
    };
  });

export const sanitizeCategoryTranslations = (
  translations: CategoryCreateFormType['translations'],
): ICategoryTranslationInput[] | undefined => {
  const cleaned = (translations || [])
    .filter((t) => t.name)
    .map((t) => ({
      language: t.language,
      name: t.name || undefined,
    }));

  return cleaned.length ? cleaned : undefined;
};

/**
 * Returns the main-language name for form initialization.
 *
 * The backend always includes the main language entry in `translations`,
 * so we look it up there first. This works regardless of whether the
 * list query swapped `category.name` to another language.
 *
 * Fallback chain: translations[mainLang] → category.name → ''
 */
export const resolveMainLanguageName = (
  category: ICategory,
  mainLanguage: string | undefined,
): string => {
  const effectiveLang = mainLanguage || category.language;
  if (!effectiveLang) return category.name || '';

  const mainTranslation = category.translations?.find(
    (t) => t.language === effectiveLang,
  );

  return mainTranslation?.name || category.name || '';
};
