import { TourCreateFormType } from '../constants/formSchema';

export interface ITourTranslationInput {
  language: string;
  name?: string;
  refNumber?: string;
  content?: string;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  pricingOptions?: Array<{
    optionId: string;
    title?: string;
    accommodationType?: string;
    note?: string;
    pricePerPerson?: number;
    domesticFlightPerPerson?: number;
    singleSupplement?: number;
  }>;
}

type TourTranslation = NonNullable<
  TourCreateFormType['translations']
>[number];

export const buildEmptyTourTranslations = (
  translationLanguages: string[],
  pricingOptionIds: string[] = [],
): TourTranslation[] =>
  translationLanguages.map((lang) => ({
    language: lang,
    name: '',
    refNumber: '',
    content: '',
    info1: '',
    info2: '',
    info3: '',
    info4: '',
    info5: '',
    pricingOptions: pricingOptionIds.map((optionId) => ({
      optionId,
      title: '',
      accommodationType: '',
      note: '',
      pricePerPerson: undefined,
      domesticFlightPerPerson: undefined,
      singleSupplement: undefined,
    })),
  }));

export const buildTranslationsFromTour = (
  tour: {
    translations?: Array<{
      language: string;
      name?: string;
      refNumber?: string;
      content?: string;
      info1?: string;
      info2?: string;
      info3?: string;
      info4?: string;
      info5?: string;
      pricingOptions?: Array<{
        optionId: string;
        title?: string;
        accommodationType?: string;
        note?: string;
        pricePerPerson?: number;
        domesticFlightPerPerson?: number;
        singleSupplement?: number;
      }>;
    }>;
    pricingOptions?: Array<{ _id: string }>;
  },
  translationLanguages: string[],
): TourTranslation[] => {
  const pricingOptionIds = (tour.pricingOptions || []).map((p) => p._id);

  return translationLanguages.map((lang) => {
    const existing = (tour.translations || []).find(
      (t) => t.language === lang,
    );

    const pricingOptions = pricingOptionIds.map((optionId) => {
      const existingOpt = (existing?.pricingOptions || []).find(
        (p) => p.optionId === optionId,
      );
      return {
        optionId,
        title: existingOpt?.title || '',
        accommodationType: existingOpt?.accommodationType || '',
        note: existingOpt?.note || '',
        pricePerPerson: existingOpt?.pricePerPerson ?? undefined,
        domesticFlightPerPerson: existingOpt?.domesticFlightPerPerson ?? undefined,
        singleSupplement: existingOpt?.singleSupplement ?? undefined,
      };
    });

    return {
      language: lang,
      name: existing?.name || '',
      refNumber: existing?.refNumber || '',
      content: existing?.content || '',
      info1: existing?.info1 || '',
      info2: existing?.info2 || '',
      info3: existing?.info3 || '',
      info4: existing?.info4 || '',
      info5: existing?.info5 || '',
      pricingOptions,
    };
  });
};

export const sanitizeTourTranslations = (
  translations: TourCreateFormType['translations'],
): ITourTranslationInput[] | undefined => {
  const cleaned = (translations || [])
    .filter(
      (t) =>
        t.name ||
        t.refNumber ||
        t.content ||
        t.info1 ||
        t.info2 ||
        t.info3 ||
        t.info4 ||
        t.info5 ||
        (t.pricingOptions || []).some(
          (p) => p.title || p.accommodationType || p.note || p.pricePerPerson || p.domesticFlightPerPerson || p.singleSupplement,
        ),
    )
    .map((t) => ({
      language: t.language,
      name: t.name || undefined,
      refNumber: t.refNumber || undefined,
      content: t.content || undefined,
      info1: t.info1 || undefined,
      info2: t.info2 || undefined,
      info3: t.info3 || undefined,
      info4: t.info4 || undefined,
      info5: t.info5 || undefined,
      pricingOptions: (t.pricingOptions || [])
        .filter((p) => p.title || p.accommodationType || p.note || p.pricePerPerson || p.domesticFlightPerPerson || p.singleSupplement)
        .map((p) => ({
          optionId: p.optionId,
          title: p.title || undefined,
          accommodationType: p.accommodationType || undefined,
          note: p.note || undefined,
          pricePerPerson: p.pricePerPerson ?? undefined,
          domesticFlightPerPerson: p.domesticFlightPerPerson ?? undefined,
          singleSupplement: p.singleSupplement ?? undefined,
        })),
    }));

  return cleaned.length ? cleaned : undefined;
};

export const syncTranslationPricingOptions = (
  translations: TourCreateFormType['translations'],
  pricingOptionIds: string[],
): TourCreateFormType['translations'] => {
  if (!translations) return translations;

  return translations.map((t) => {
    const existingMap = new Map(
      (t.pricingOptions || []).map((p) => [p.optionId, p]),
    );

    const syncedOptions = pricingOptionIds.map((optionId) => {
      const existing = existingMap.get(optionId);
      return existing || { optionId, title: '', accommodationType: '', note: '', pricePerPerson: undefined, domesticFlightPerPerson: undefined, singleSupplement: undefined };
    });

    return { ...t, pricingOptions: syncedOptions };
  });
};
