import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const mutations = {
  /**
   * Cms post add
   */
  cmsPostsAdd: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models, user, clientPortalId } = context;
    const { input } = args;
    input.authorId = user._id;

    if (clientPortalId) {
      input.clientPortalId = clientPortalId;
    }

    return models.Posts.createPost(input);
  },

  /**
   * Cms post edit
   */
  cmsPostsEdit: async (
    _parent: any,
    args: any,
    context: IContext
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
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    await models.PostTranslations.deleteMany({ postId: _id });
    return models.Posts.deleteOne({ _id });
  },

  /**
   * Cms post change status
   */
  cmsPostsChangeStatus: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id, status } = args;

    return models.Posts.changeStatus(_id, status);
  },

  /**
   * Cms post increment view count
   */
  cmsPostsIncrementViewCount: async (
    _parent: any,
    args: any,
    context: IContext
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
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Posts.toggleFeatured(_id);
  },

  cmsPostsAddTranslation: async (
    _parent: any,
    args: any,
    context: IContext
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
      default:
        throw new Error('Invalid type');
    }

    const object = await model.findOne({ _id: input.postId });
    if (!object) {
      throw new Error('Object not found');
    }

    return models.PostTranslations.createPostTranslation(input);
  },

  cmsPostsEditTranslation: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;
    const translation = await models.PostTranslations.findOne({
      language: input.language,
      postId: input.postId,
    });
    if (!translation) {
      return models.PostTranslations.createPostTranslation(input);
    }

    return models.PostTranslations.updatePostTranslation(
      translation._id,
      input
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

export default mutations;
