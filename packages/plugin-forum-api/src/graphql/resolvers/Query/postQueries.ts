import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

// forumPost(_id: ID!): ForumPost
// forumPosts(_id: [ID!], categoryId: [ID!], offset: Int, limit: Int): [ForumPost!]

const PostQueries: IObjectTypeResolver<any, IContext> = {
  forumPost(_, { _id }, { models: { Post } }) {
    return Post.findById(_id);
  },
  async forumPosts(_, params, { models: { Post, Category } }) {
    const query: any = {};

    const {
      limit = 0,
      offset = 0,
      categoryIncludeDescendants = false,
      ...queryParams
    } = params;

    console.log({ queryParams, query });

    const fields = ['_id', 'state'];

    for (const field of fields) {
      const param = queryParams[field];

      if (param) {
        query[field] = { $in: param };
      }
    }

    if (queryParams.categoryId) {
      if (categoryIncludeDescendants) {
        const descendants =
          (await Category.getDescendantsOf(queryParams.categoryId)) || [];
        const allIds = descendants.map(d => d._id);
        allIds.push(...queryParams.categoryId);
        query.categoryId = { $in: allIds };
      } else {
        query.categoryId = { $in: queryParams.categoryId };
      }
    }

    console.log({ queryParams, query });
    return Post.find(query)
      .skip(offset)
      .limit(limit)
      .lean();
  }
};

export default PostQueries;
