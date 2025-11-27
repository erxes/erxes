import { Resolver } from 'erxes-api-shared/core-types';

import { IContext } from '~/connectionResolvers';

export const postsMutations: Record<string, Resolver> = {
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
};
