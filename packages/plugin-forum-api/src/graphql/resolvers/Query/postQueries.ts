import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IModels } from '../../../db/models';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { LoginRequiredError } from '../../../customErrors';
import { Types } from 'mongoose';

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

  for (const field of ['isFeaturedByAdmin', 'isFeaturedByUser']) {
    const param = params[field];

    if (param !== undefined && param !== null) {
      query[field] = param === true ? { $eq: true } : { $ne: true };
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
      // post.content = '';
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
      // .select('-content -translations.content')
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean();

    return res;
  },
  async forumPostsCount(_, params, { models, user }) {
    const { Post } = models;

    const query: any = await buildPostsQuery(models, params, user);

    return Post.find(query).countDocuments();
  },

  async forumLastPublishedFollowingUsers(
    _,
    { categoryId, limit = 0, offset = 0 },
    { models: { Post, FollowCpUser }, cpUser }
  ) {
    if (!cpUser) throw new LoginRequiredError();
    const follows = await FollowCpUser.find({ followerId: cpUser.userId })
      .select('followeeId')
      .lean();

    const createdByCpIds = follows.map(f => f.followeeId);

    const query: any = {
      createdByCpId: { $in: createdByCpIds }
    };

    if (categoryId) {
      query.categoryId = Types.ObjectId(categoryId);
    }

    const aggregationStates: any[] = [
      { $match: query },
      { $sort: { lastPublishedAt: -1 } },
      {
        $group: {
          _id: '$createdByCpId',
          createdByCpId: { $first: '$createdByCpId' }
        }
      },
      { $skip: offset }
    ];

    if (limit > 0) {
      aggregationStates.push({ $limit: limit });
    }

    const result = await Post.aggregate(aggregationStates);

    return result.map(r => ({
      __typename: 'ClientPortalUser',
      _id: r.createdByCpId
    }));
  },
  async forumMostPublishedUsers(
    _,
    { limit = 0, offset = 0, categoryId },
    { models: { Post } }
  ) {
    const query: any = {
      state: 'PUBLISHED',
      categoryApprovalState: 'APPROVED',
      $and: [
        {
          createdByCpId: { $ne: null }
        },
        {
          createdByCpId: { $ne: '' }
        }
      ]
    };

    if (categoryId) {
      query.categoryId = Types.ObjectId(categoryId);
    }

    const aggregationStates: any[] = [
      { $match: query },
      { $sort: { lastPublishedAt: -1 } },
      {
        $group: {
          _id: '$createdByCpId',
          count: {
            $sum: 1
          }
        }
      },
      { $sort: { count: -1 } },
      { $skip: offset }
    ];

    if (limit > 0) {
      aggregationStates.push({ $limit: limit });
    }

    const result = await Post.aggregate(aggregationStates);

    return result.map(r => ({
      __typename: 'ClientPortalUser',
      _id: r._id
    }));
  }
};

export default PostQueries;
