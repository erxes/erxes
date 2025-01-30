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
};

requireLogin(mutations, 'cmsPostsAdd');
requireLogin(mutations, 'cmsPostsEdit');
requireLogin(mutations, 'cmsPostsRemove');
requireLogin(mutations, 'cmsPostsChangeStatus');
requireLogin(mutations, 'cmsPostsToggleFeatured');

checkPermission(mutations, 'cmsPostsAdd', 'cmsPostsAdd', []);
checkPermission(mutations, 'cmsPostsEdit', 'cmsPostsEdit', []);
checkPermission(mutations, 'cmsPostsRemove', 'cmsPostsRemove', []);
checkPermission(mutations, 'cmsPostsChangeStatus', 'cmsPostsEdit', []);
checkPermission(mutations, 'cmsPostsToggleFeatured', 'cmsPostsEdit', []);

export default mutations;
