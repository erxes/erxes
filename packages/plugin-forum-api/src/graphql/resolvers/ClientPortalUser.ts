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
  }
};

export default ClientPortalUser;
