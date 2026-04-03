import { IContext } from '~/connectionResolvers';
import { ITour, IPricingOption } from '@/bms/@types/tour';

const validateTranslationPricingOptions = (
  pricingOptions: IPricingOption[] = [],
  translations: any[] = [],
) => {
  const validOptionIds = new Set(
    pricingOptions
      .map((p) => p?._id)
      .filter((id): id is string => Boolean(id)),
  );

  for (const translation of translations) {
    for (const option of translation?.pricingOptions || []) {
      if (!validOptionIds.has(option.optionId)) {
        throw new Error(
          `Invalid translation pricing optionId "${option.optionId}" for language "${translation.language}"`,
        );
      }
    }
  }
};

const saveTourTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  await Promise.all(
    translations.map((t) =>
      models.TourTranslations.upsertTranslation({ ...t, objectId }),
    ),
  );
};

const tourMutations = {
  bmsTourAdd: async (
    _root,
    { translations, ...doc }: { translations?: any[] } & ITour,
    { user, models }: IContext,
  ) => {
    validateTranslationPricingOptions(doc.pricingOptions || [], translations ?? []);

    const tour = await models.Tours.createTour(doc, user);
    await saveTourTranslations(models, tour._id, translations ?? []);
    return tour;
  },

  bmsTourEdit: async (
    _root,
    { _id, translations, ...doc }: { _id: string; translations?: any[] } & Partial<ITour>,
    { models }: IContext,
  ) => {
    const existingTour = await models.Tours.findOne({ _id });
    if (!existingTour) throw new Error('Tour not found');

    const finalPricingOptions = doc.pricingOptions ?? existingTour.pricingOptions ?? [];
    validateTranslationPricingOptions(finalPricingOptions, translations ?? []);

    const tour = await models.Tours.updateTour(_id, doc as ITour);
    await saveTourTranslations(models, _id, translations ?? []);
    return tour;
  },

  bmsTourViewCount: async (_root, { _id }, { models }: IContext) => {
    return models.Tours.findOneAndUpdate(
      { _id },
      { $inc: { viewCount: 1 } },
    ).exec();
  },

  bmsTourRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await Promise.all(
      ids.map((id) => models.TourTranslations.deleteTranslationsForObject(id)),
    );
    await models.Tours.removeTour(ids);
    return ids;
  },

  bmsTourCategoryAdd: async (_root, doc, { models }: IContext) => {
    return models.BmsTourCategories.createTourCategory(doc);
  },

  bmsTourCategoryEdit: async (_root, { _id, ...doc }, { models }: IContext) => {
    return models.BmsTourCategories.updateTourCategory(_id, doc as any);
  },

  bmsTourCategoryRemove: async (
    _root,
    { _id, ids }: { _id?: string; ids?: string[] },
    { models }: IContext,
  ) => {
    const removeIds = ids?.length ? ids : _id ? [_id] : [];
    return models.BmsTourCategories.removeTourCategory(removeIds);
  },

  // Standalone — edit just a translation without touching the tour
  bmsTourTranslationUpsert: async (
    _root,
    { input }: { input: any },
    { models }: IContext,
  ) => {
    const tour = await models.Tours.findOne({ _id: input.objectId });
    if (!tour) throw new Error('Tour not found');
    return models.TourTranslations.upsertTranslation(input);
  },

  bmsTourTranslationDelete: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.TourTranslations.deleteTranslation(_id);
  },
};

export default tourMutations;