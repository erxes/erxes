import {
  checkPermission,
  requireLogin,
} from 'erxes-api-shared/core-modules';
import { Resolver } from 'erxes-api-shared/core-types';

import { IContext } from '~/connectionResolvers';

const mutations: Record<string, Resolver> = {
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

    await models.Translations.deleteMany({ postId: _id });
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
   * Cms post increment view count
   */
  cpPostsIncrementViewCount: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models, session } = context;
    const { _id } = args;

    if (!session.viewedPosts) {
      session.viewedPosts = [];
    }

    if (!session.viewedPosts.includes(_id)) {
      await models.Posts.increaseViewCount(_id);
      session.viewedPosts.push(_id);
      await session.save();
    }

    return models.Posts.findOne({ _id });
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
    const post = await models.Posts.findOne({ _id: input.postId });
    if (!post) {
      throw new Error('Post not found');
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

    return models.Translations.updateTranslation(
      translation._id,
      input,
    );
  },
};

requireLogin(mutations, 'cmsPostsAdd');
requireLogin(mutations, 'cmsPostsEdit');
requireLogin(mutations, 'cmsPostsRemove');
requireLogin(mutations, 'cmsPostsChangeStatus');
requireLogin(mutations, 'cmsPostsToggleFeatured');

checkPermission(mutations, 'cmsPostsAdd', 'manageCms', []);
checkPermission(mutations, 'cmsPostsEdit', 'manageCms', []);
checkPermission(mutations, 'cmsPostsRemove', 'manageCms', []);
checkPermission(mutations, 'cmsPostsChangeStatus', 'manageCms', []);
checkPermission(mutations, 'cmsPostsToggleFeatured', 'manageCms', []);

mutations.cpPostsIncrementViewCount.wrapperConfig = {
  forClientPortal: true,
};

export default mutations;
