import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IForumClientPortalUser } from '../../db/models/forumClientPortalUser';
import { identity } from 'lodash';

const ClientPortalUser: IObjectTypeResolver<
  IForumClientPortalUser,
  IContext
> = {
  async forumSubscriptionEndsAfter(
    { _id },
    _,
    { models: { ForumClientPortalUser } }
  ) {
    const doc = await ForumClientPortalUser.findByIdOrCreate(_id);
    return doc.subscriptionEndsAfter;
  },

  async forumIsSubscribed({ _id }, _, { models: { ForumClientPortalUser } }) {
    return ForumClientPortalUser.findAndIsSubscribed(_id);
  },

  async forumFollowerCpUsers(
    { _id },
    { limit = 0, offset = 0 },
    { models: { FollowCpUser } }
  ) {
    const follows = await FollowCpUser.find({ followeeId: _id })
      .limit(limit)
      .skip(offset)
      .lean();
    return follows.filter(identity).map(follow => ({
      __typename: 'ClientPortalUser',
      _id: follow.followerId
    }));
  },

  async forumFollowingCpUsers(
    { _id },
    { limit = 0, offset = 0 },
    { models: { FollowCpUser } }
  ) {
    const follows = await FollowCpUser.find({ followerId: _id })
      .limit(limit)
      .skip(offset)
      .lean();
    return follows.filter(identity).map(follow => ({
      __typename: 'ClientPortalUser',
      _id: follow.followeeId
    }));
  },
  async forumCategoriesAllowedToPost({ _id }, _, { models: { Category } }) {
    return Category.categoriesUserAllowedToPost(_id);
  },
  async forumFollowingTags({ _id }, _, { models: { FollowTag } }) {
    const follows = await FollowTag.find({ followerId: _id }).lean();
    return follows.map(follow => ({ __typename: 'Tag', _id: follow.tagId }));
  },

  async forumFollowerCount({ _id }, _, { models: { FollowCpUser } }) {
    return FollowCpUser.countDocuments({ followeeId: _id });
  },
  async forumIsFollowedByCurrentUser(
    { _id },
    _,
    { models: { FollowCpUser }, cpUser }
  ) {
    if (!cpUser) return false;
    const follow = await FollowCpUser.findOne({
      followeeId: _id,
      followerId: cpUser.userId
    });
    return !!follow;
  }
};

export default ClientPortalUser;
