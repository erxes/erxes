import { Resolver } from 'erxes-api-shared/core-types';

import { IContext } from '~/connectionResolvers';

export const postMutations: Record<string, Resolver> = {
  /**
   * Cms post add
   */
  cmsPostsAdd: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models, user } = context;
    const { input } = args;
    input.authorId = user._id;

    return models.Posts.createPost(input);
  },

  /**
   * Cms post edit
   */
  cmsPostsEdit: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id, input } = args;

    return models.Posts.updatePost(_id, input);
  },

  /**
   * Cms post delete
   */
  cmsPostsRemove: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Posts.deleteOne({ _id });
  },

  /**
   * Cms posts remove many
   */
  cmsPostsRemoveMany: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _ids } = args;

    const result = await models.Posts.deleteMany({ _id: { $in: _ids } });
    return { deletedCount: result.deletedCount };
  },

  /**
   * Cms post change status
   */
  cmsPostsChangeStatus: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id, status } = args;

    return models.Posts.changeStatus(_id, status);
  },

  /**
   * Cms post toggle featured
   */
  cmsPostsToggleFeatured: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Posts.toggleFeatured(_id);
  },

  cmsAddTranslation: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;
    const { type } = input;

    let model: any;

    switch (type) {
      case 'post':
        model = models.Posts;
        break;
      case 'page':
        model = models.Pages;
        break;
      case 'category':
        model = models.Categories;
        break;
      case 'tag':
        model = models.PostTags;
        break;
      case 'menu':
        model = models.MenuItems;
        break;
      default:
        throw new Error('Invalid type');
    }

    const object = await model.findOne({ _id: input.postId });
    if (!object) {
      throw new Error('Object not found');
    }

    return models.Translations.createTranslation(input);
  },

  cmsEditTranslation: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;
    const translation = await models.Translations.findOne({
      language: input.language,
      postId: input.postId,
    });
    if (!translation) {
      return models.Translations.createTranslation(input);
    }

    return models.Translations.updateTranslation({
      ...translation.toObject(),
      ...input,
    });
  },
};
