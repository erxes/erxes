import { IContext } from '~/connectionResolvers';

const WebPost = {
  async author(post: any) {
    if (!post.authorId) {
      return null;
    }

    return {
      __typename: 'User',
      _id: post.authorId,
    };
  },

  async web(post: any) {
    if (!post.webId) {
      return null;
    }

    return {
      __typename: 'Web',
      _id: post.webId,
    };
  },

  async categories(post: any, _params: unknown, { models }: IContext) {
    if (!post.categoryIds || post.categoryIds.length === 0) {
      return [];
    }

    return models.Categories.find({ _id: { $in: post.categoryIds } }).lean();
  },
};

export default {
  WebPost,
};
