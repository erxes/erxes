import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IModels } from '../../../db/models';
import { IUserDocument } from '@erxes/api-utils/src/types';

export const buildPostsQuery = async (
  { Category }: IModels,
  params: any,
  user?: IUserDocument | null
) => {
  const query: any = {};

  const { customQuery = {} } = params;

  for (const field of [
    '_id',
    'state',
    'createdById',
    'createdByCpId',
    'categoryApprovalState'
  ]) {
    const param = params[field];

    if (param) {
      query[field] = { $in: param };
    }
  }

  if (params.categoryId) {
    if (params.categoryIncludeDescendants) {
      const descendants =
        (await Category.getDescendantsOf(params.categoryId)) || [];
      const allIds = [...params.categoryId, ...descendants.map(d => d._id)];
      query.categoryId = { $in: allIds };
    } else {
      query.categoryId = { $in: params.categoryId };
    }

    if (!user) {
      query.categoryApprovalState = 'APPROVED';
    }
  }

  if (params.search) {
    query.$text = { $search: params.search };
  }

  return { ...query, ...customQuery };
};

const PostQueries: IObjectTypeResolver<any, IContext> = {
  async forumPost(_, { _id }, { models: { Post, Category }, user, cpUser }) {
    if (!user) {
      await Post.updateOne({ _id }, { $inc: { viewCount: 1 } });
    }

    const post = await Post.findByIdOrThrow(_id);
    if (user) return post;

    const [isAllowedToRead] = await Category.isUserAllowedToRead(post, cpUser);

    if (!isAllowedToRead) {
      post.content = '';
      post.contentRestricted = true;
    }

    if (post.state === 'DRAFT') {
      const draftError = new Error('This post is in draft');
      if (!cpUser) throw draftError;

      if (post.createdByCpId !== cpUser.userId) throw draftError;
    }

    // TODO: check user permission and remove content before returning
    return post;
  },
  async forumPosts(_, params, { models, user }) {
    const { Post } = models;

    const query: any = await buildPostsQuery(models, params, user);
    const { limit = 0, offset = 0, sort = {} } = params;

    console.log(query);

    const res = await Post.find(query)
      .select('-content')
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean();

    return res;
  },
  async forumPostsCount(_, params, { models }) {
    const { Post } = models;

    const query: any = await buildPostsQuery(models, params);

    return Post.find(query).countDocuments();
  }
};

export default PostQueries;
