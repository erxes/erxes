import { IContext } from '~/connectionResolvers';

const getDefaultLanguage = async (
  models: IContext['models'],
  clientPortalId: string,
): Promise<string> => {
  const cms = await models.CMS.findOne({ clientPortalId }).lean();
  return cms?.language || 'en';
};

const saveCategoryTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
  excludeLanguage?: string,
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  const filtered = excludeLanguage
    ? translations.filter(
        (translation: any) => translation?.language !== excludeLanguage,
      )
    : translations;

  if (filtered.length === 0) return;

  await Promise.all(
    filtered.map((translation: any) =>
      models.Translations.upsertTranslation({
        ...translation,
        objectId,
        type: translation.type || 'category',
      }),
    ),
  );
};

export const contentCmsCategoryMutations = {
  /**
   * Cms category add
   */
  cmsCategoriesAdd: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;
    const { translations, ...categoryInput } = input;
    delete categoryInput.language;

    if (
      (!categoryInput.name || !String(categoryInput.name).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(
        models,
        categoryInput.clientPortalId,
      );

      const fallback =
        translations.find(
          (translation: any) => translation?.language === defaultLanguage,
        ) || translations[0];

      if (fallback) {
        categoryInput.name = fallback.title || categoryInput.name;
        categoryInput.description =
          fallback.content || categoryInput.description;
        categoryInput.customFieldsData =
          fallback.customFieldsData || categoryInput.customFieldsData;
      }
    }

    const category = await models.Categories.createCategory(categoryInput);

    await saveCategoryTranslations(models, category._id, translations || []);

    return category;
  },

  /**
   * Cms category edit
   */
  cmsCategoriesEdit: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id, input } = args;
    const { translations, language, ...categoryInput } = input;

    const clientPortalId =
      categoryInput.clientPortalId ||
      (
        await models.Categories.findOne({ _id })
          .select({ clientPortalId: 1 })
          .lean()
      )?.clientPortalId;

    if (language && clientPortalId) {
      const defaultLanguage = await getDefaultLanguage(models, clientPortalId);

      if (language !== defaultLanguage) {
        const translationDoc: any = {
          objectId: _id,
          language,
          type: 'category',
        };

        if (categoryInput.name !== undefined) {
          translationDoc.title = categoryInput.name;
        }
        if (categoryInput.description !== undefined) {
          translationDoc.content = categoryInput.description;
        }
        if (categoryInput.customFieldsData !== undefined) {
          translationDoc.customFieldsData = categoryInput.customFieldsData;
        }

        await models.Translations.upsertTranslation(translationDoc);

        const { name, description, customFieldsData, ...safeCategoryInput } =
          categoryInput;

        safeCategoryInput.clientPortalId = clientPortalId;

        const category = await models.Categories.updateCategory(
          _id,
          safeCategoryInput,
        );

        await saveCategoryTranslations(
          models,
          _id,
          translations || [],
          language,
        );

        return category;
      }
    }

    const category = await models.Categories.updateCategory(_id, categoryInput);

    await saveCategoryTranslations(models, _id, translations || []);

    return category;
  },

  /**
   * Cms category remove
   */
  cmsCategoriesRemove: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    const result = await models.Categories.deleteOne({ _id });

    await models.Translations.deleteMany({
      $or: [{ objectId: _id, type: 'category' }, { postId: _id }],
    });

    return result;
  },

  /**
   * Cms category toggle status
   */
  cmsCategoriesToggleStatus: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Categories.toggleStatus(_id);
  },
};
