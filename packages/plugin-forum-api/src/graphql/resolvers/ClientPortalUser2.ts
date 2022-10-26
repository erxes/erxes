import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { identity } from 'lodash';

const ClientPortalUser2: IObjectTypeResolver<any, IContext> = {
  async forumFollowerCpUsers(
    { _id },
    { limit = 0, offset = 0 },
    { models: { FollowCpUser } }
  ) {
    const follows = await FollowCpUser.find({ followeeId: _id })
      .limit(limit)
      .skip(offset)
      .lean();
    return follows
      .filter(identity)
      .map(follow => ({
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
    return follows
      .filter(identity)
      .map(follow => ({
        __typename: 'ClientPortalUser',
        _id: follow.followeeId
      }));
  }
};

export default ClientPortalUser2;
