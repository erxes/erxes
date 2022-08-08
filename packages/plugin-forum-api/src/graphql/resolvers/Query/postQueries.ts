import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

// forumPost(_id: ID!): ForumPost
// forumPosts(_id: [ID!], categoryId: [ID!], offset: Int, limit: Int): [ForumPost!]

const PostQueries: IObjectTypeResolver<any, IContext> = {
  forumPost: (_, { _id }, { models: { Post } }) => {
    return Post.findById(_id);
  },
  forumPosts: (_, params, { models: { Post } }) => {
    const query: any = {};

    const { limit = 0, offset = 0, ...queryParams } = params;

    const fields = ['_id', 'categoryId', 'state'];

    for (const field of fields) {
      const param = params[field];

      if (param) {
        query[field] = { $in: param };
      }
    }

    return Post.find(query)
      .skip(offset)
      .limit(limit)
      .lean();
  }
};

export default PostQueries;
