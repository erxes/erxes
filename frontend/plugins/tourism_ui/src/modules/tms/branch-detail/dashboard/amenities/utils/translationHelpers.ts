import { IAmenityTranslationInput } from '../hooks/useCreateAmenity';
import { AmenityCreateFormType } from '../constants/formSchema';
import { IAmenity } from '../types/amenity';

export const buildEmptyAmenityTranslations = (
  translationLanguages: string[],
): AmenityCreateFormType['translations'] =>
  translationLanguages.map((lang) => ({
    language: lang,
    name: '',
  }));

export const buildTranslationsFromAmenity = (
  amenity: IAmenity,
  translationLanguages: string[],
): AmenityCreateFormType['translations'] =>
  translationLanguages.map((lang) => {
    const existing = (amenity.translations || []).find(
      (t) => t.language === lang,
    );
    return {
      language: lang,
      name: existing?.name || '',
    };
  });

export const sanitizeAmenityTranslations = (
  translations: AmenityCreateFormType['translations'],
): IAmenityTranslationInput[] | undefined => {
  const cleaned = (translations || [])
    .filter((t) => t.name)
    .map((t) => ({
      language: t.language,
      name: t.name || undefined,
    }));

  return cleaned.length ? cleaned : undefined;
};
