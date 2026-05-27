import { IElementTranslationInput } from '../hooks/useCreateElement';
import { ElementCreateFormType } from '../constants/formSchema';
import { IElement } from '../types/element';

export const buildEmptyTranslations = (
  translationLanguages: string[],
): ElementCreateFormType['translations'] =>
  translationLanguages.map((lang) => ({
    language: lang,
    name: '',
    note: '',
    cost: undefined,
  }));

export const buildTranslationsFromElement = (
  element: IElement,
  translationLanguages: string[],
): ElementCreateFormType['translations'] =>
  translationLanguages.map((lang) => {
    const existing = (element.translations || []).find(
      (t) => t.language === lang,
    );
    return {
      language: lang,
      name: existing?.name || '',
      note: existing?.note || '',
      cost: existing?.cost,
    };
  });

export const sanitizeTranslations = (
  translations: ElementCreateFormType['translations'],
): IElementTranslationInput[] | undefined => {
  const cleaned = (translations || [])
    .filter((t) => t.name || t.note || t.cost !== undefined)
    .map((t) => ({
      language: t.language,
      name: t.name || undefined,
      note: t.note || undefined,
      cost: t.cost !== undefined && !Number.isNaN(t.cost) ? t.cost : undefined,
    }));

  return cleaned.length ? cleaned : undefined;
};

/**
 * Returns the main-language name for form initialization.
 *
 * The backend always includes the main language entry in `translations`,
 * so we look it up there first. This works regardless of whether the
 * list query swapped `element.name` to another language.
 *
 * Fallback chain: translations[mainLang] → element.name → ''
 */
export const resolveMainLanguageName = (
  element: IElement,
  mainLanguage: string | undefined,
): string => {
  const effectiveLang = mainLanguage || element.language;
  if (!effectiveLang) return element.name || '';

  const mainTranslation = element.translations?.find(
    (t) => t.language === effectiveLang,
  );

  return mainTranslation?.name || element.name || '';
};
