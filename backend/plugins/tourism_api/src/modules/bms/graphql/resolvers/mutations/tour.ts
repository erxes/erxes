import { IContext } from '~/connectionResolvers';
import { ITour, IPricingOption, ITourCategory } from '@/bms/@types/tour';

const validateTranslationPricingOptions = (
  pricingOptions: IPricingOption[] = [],
  translations: any[] = [],
) => {
  const validOptionIds = new Set(
    pricingOptions.map((p) => p?._id).filter((id): id is string => Boolean(id)),
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

const saveTourCategoryTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;
  await Promise.all(
    translations.map((t) =>
      models.TourCategoryTranslations.upsertTranslation({ ...t, objectId }),
    ),
  );
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
    validateTranslationPricingOptions(
      doc.pricingOptions || [],
      translations ?? [],
    );

    const tour = await models.Tours.createTour(doc, user);
    await saveTourTranslations(models, tour._id, translations ?? []);
    return tour;
  },

  bmsTourEdit: async (
    _root,
    {
      _id,
      translations,
      ...doc
    }: { _id: string; translations?: any[] } & Partial<ITour>,
    { models }: IContext,
  ) => {
    const existingTour = await models.Tours.findOne({ _id });
    if (!existingTour) throw new Error('Tour not found');

    const finalPricingOptions =
      doc.pricingOptions ?? existingTour.pricingOptions ?? [];
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

  bmsTourCategoryAdd: async (
    _root,
    { translations, ...doc }: { translations?: any[] } & ITourCategory,
    { models }: IContext,
  ) => {
    const category = await models.BmsTourCategories.createTourCategory(
      doc as any,
    );
    await saveTourCategoryTranslations(
      models,
      category._id,
      translations ?? [],
    );
    return category;
  },

  bmsTourCategoryEdit: async (
    _root,
    {
      _id,
      translations,
      ...doc
    }: { _id: string; translations?: any[] } & ITourCategory,
    { models }: IContext,
  ) => {
    const category = await models.BmsTourCategories.updateTourCategory(
      _id,
      doc as any,
    );
    await saveTourCategoryTranslations(models, _id, translations ?? []);
    return category;
  },

  bmsTourCategoryRemove: async (
    _root,
    { _id, ids }: { _id?: string; ids?: string[] },
    { models }: IContext,
  ) => {
    const removeIds = ids?.length ? ids : _id ? [_id] : [];
    await Promise.all(
      removeIds.map((id) =>
        models.TourCategoryTranslations.deleteTranslationsForObject(id),
      ),
    );
    return models.BmsTourCategories.removeTourCategory(removeIds);
  },

  bmsTourCategoryTranslationUpsert: async (
    _root,
    { input }: { input: any },
    { models }: IContext,
  ) => {
    const category = await models.BmsTourCategories.findOne({
      _id: input.objectId,
    });
    if (!category) throw new Error('Tour category not found');
    return models.TourCategoryTranslations.upsertTranslation(input);
  },

  bmsTourCategoryTranslationDelete: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.TourCategoryTranslations.deleteTranslation(_id);
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
