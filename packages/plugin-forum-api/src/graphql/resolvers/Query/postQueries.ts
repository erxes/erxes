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
    'categoryApprovalState',
    'tagIds'
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

    const requirement = await Category.isUserAllowedToRead(post, cpUser);

    if (requirement) {
      post.content = '';
      post.requiredLevel = requirement.requiredLevel;
      post.isPermissionRequired = requirement.isPermissionGroupRequired;
    }

    if (post.state === 'DRAFT') {
      if (!cpUser || post.createdByCpId !== cpUser.userId)
        throw new Error('This post is in draft');
    }

    return post;
  },
  async forumPosts(_, params, { models, user }) {
    const { Post } = models;

    const query: any = await buildPostsQuery(models, params, user);
    const { limit = 0, offset = 0, sort = {} } = params;

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
