import { IContext } from '~/connectionResolvers';

export const contentCmsTagMutations = {
  /**
   * Cms tag add
   */
  cmsTagsAdd: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;

    return models.PostTags.createTag(input);
  },

  /**
   * Cms tag edit
   */
  cmsTagsEdit: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id, input } = args;

    return models.PostTags.updateTag(_id, input);
  },

  /**
   * Cms tag remove
   */
  cmsTagsRemove: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.PostTags.deleteOne({ _id });
  },

  /**
   * Cms tag toggle status
   */
  cmsTagsToggleStatus: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.PostTags.toggleStatus(_id);
  },
};
