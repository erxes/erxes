import { IItineraryTranslationInput } from '../hooks/useCreateItinerary';
import { ItineraryCreateFormType } from '../constants/formSchema';
import { IItinerary } from '../types/itinerary';

export const buildEmptyTranslations = (
  translationLanguages: string[],
): ItineraryCreateFormType['translations'] =>
  translationLanguages.map((lang) => ({
    language: lang,
    name: '',
    content: '',
    foodCost: undefined,
    gasCost: undefined,
    driverCost: undefined,
    guideCost: undefined,
    guideCostExtra: undefined,
    groupDays: [],
  }));

export const buildTranslationsFromItinerary = (
  itinerary: IItinerary,
  translationLanguages: string[],
): ItineraryCreateFormType['translations'] =>
  translationLanguages.map((lang) => {
    const existing = (itinerary.translations || []).find(
      (t) => t.language === lang,
    );
    return {
      language: lang,
      name: existing?.name || '',
      content: existing?.content || '',
      foodCost: existing?.foodCost,
      gasCost: existing?.gasCost,
      driverCost: existing?.driverCost,
      guideCost: existing?.guideCost,
      guideCostExtra: existing?.guideCostExtra,
      groupDays: existing?.groupDays || [],
    };
  });

export const sanitizeTranslations = (
  translations: ItineraryCreateFormType['translations'],
): IItineraryTranslationInput[] | undefined => {
  const cleaned = (translations || [])
    .filter(
      (t) =>
        t.name ||
        t.content ||
        t.foodCost !== undefined ||
        t.gasCost !== undefined ||
        t.driverCost !== undefined ||
        t.guideCost !== undefined ||
        t.guideCostExtra !== undefined ||
        (t.groupDays && t.groupDays.length > 0),
    )
    .map((t) => ({
      language: t.language,
      name: t.name || undefined,
      content: t.content || undefined,
      foodCost:
        t.foodCost !== undefined && !Number.isNaN(t.foodCost)
          ? t.foodCost
          : undefined,
      gasCost:
        t.gasCost !== undefined && !Number.isNaN(t.gasCost)
          ? t.gasCost
          : undefined,
      driverCost:
        t.driverCost !== undefined && !Number.isNaN(t.driverCost)
          ? t.driverCost
          : undefined,
      guideCost:
        t.guideCost !== undefined && !Number.isNaN(t.guideCost)
          ? t.guideCost
          : undefined,
      guideCostExtra:
        t.guideCostExtra !== undefined && !Number.isNaN(t.guideCostExtra)
          ? t.guideCostExtra
          : undefined,
      groupDays:
        t.groupDays && t.groupDays.length > 0
          ? t.groupDays
              .map((gd, idx) => ({
                day: gd.day ?? idx + 1,
                title: gd.title || undefined,
                content: gd.content || undefined,
              }))
              .filter((gd) => gd.title || gd.content)
          : undefined,
    }));

  return cleaned.length ? cleaned : undefined;
};

/**
 * Returns the main-language name for form initialization.
 *
 * The backend always includes the main language entry in `translations`,
 * so we look it up there first. This works regardless of whether the
 * list query swapped `itinerary.name` to another language.
 *
 * Fallback chain: translations[mainLang] → itinerary.name → ''
 */
export const resolveMainLanguageName = (
  itinerary: IItinerary,
  mainLanguage: string | undefined,
): string => {
  if (!mainLanguage) return itinerary.name || '';

  const mainTranslation = itinerary.translations?.find(
    (t) => t.language === mainLanguage,
  );

  return mainTranslation?.name || itinerary.name || '';
};
