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
