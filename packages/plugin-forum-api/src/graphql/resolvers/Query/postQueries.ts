import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IModels } from '../../../db/models';

// forumPost(_id: ID!): ForumPost
// forumPosts(_id: [ID!], categoryId: [ID!], offset: Int, limit: Int): [ForumPost!]

const buildPostsQuery = async ({ Category }: IModels, params: any) => {
  const query: any = {};

  for (const field of ['_id', 'state']) {
    const param = params[field];

    if (param) {
      query[field] = { $in: param };
    }
  }

  if (params.categoryId) {
    if (params.categoryIncludeDescendants) {
      const descendants =
        (await Category.getDescendantsOf(params.categoryId)) || [];
      const allIds = descendants.map(d => d._id);
      allIds.push(...params.categoryId);
      query.categoryId = { $in: allIds };
    } else {
      query.categoryId = { $in: params.categoryId };
    }
  }

  return query;
};

const PostQueries: IObjectTypeResolver<any, IContext> = {
  forumPost(_, { _id }, { models: { Post } }) {
    return Post.findById(_id);
  },
  async forumPosts(_, params, { models }) {
    const { Post } = models;

    const query: any = await buildPostsQuery(models, params);
    const { limit = 0, offset = 0 } = params;

    return Post.find(query)
      .skip(offset)
      .limit(limit)
      .lean();
  },
  async forumPostsCount(_, params, { models }) {
    const { Post } = models;

    const query: any = await buildPostsQuery(models, params);

    return Post.find(query).countDocuments();
  }
};

export default PostQueries;
