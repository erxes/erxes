import { IContext } from '../../connectionResolver';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Posts.findOne({ _id });
  },

  async author(post: any, _params, { models }: IContext) {
    if (post.authorKind === 'user') {
      return {
        _id: post.authorId,
        __typename: 'User',
      };
    } else if (post.authorKind === 'clientPortalUser') {
      return {
        _id: post.authorId,
        __typename: 'ClientPortalUser',
      };
    }
  },

  async tags(post: any, _params, { models }: IContext) {
    return models.PostTags.find({ _id: { $in: post.tagIds } }).lean();
  },

  async categories(post: any, _params, { models }: IContext) {
    return models.Categories.find({ _id: { $in: post.categoryIds } }).lean();
  },
};
