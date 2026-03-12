import { IContext } from '~/connectionResolvers';

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

    const category = await models.Categories.createCategory(categoryInput);

    if (Array.isArray(translations) && translations.length > 0) {
      const docs = translations.map((translation: any) => ({
        ...translation,
        postId: category._id,
        type: translation.type || 'category',
      }));

      await models.Translations.insertMany(docs);
    }

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
    const { translations, ...categoryInput } = input;

    const category = await models.Categories.updateCategory(_id, categoryInput);

    if (Array.isArray(translations) && translations.length > 0) {
      await Promise.all(
        translations.map((translation: any) =>
          models.Translations.updateTranslation({
            ...translation,
            postId: _id,
            type: translation.type || 'category',
          }),
        ),
      );
    }

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

    await models.Translations.deleteMany({ postId: _id });

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
