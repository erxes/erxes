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

    const category = await models.Categories.createCategory(input);
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

    return models.Categories.updateCategory(_id, input);
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

    return models.Categories.deleteOne({ _id });
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
