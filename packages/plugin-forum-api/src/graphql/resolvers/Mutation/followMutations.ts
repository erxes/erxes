import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const followMutations: IObjectTypeResolver<any, IContext> = {
  async forumFollowCpUser(_, args, { models: { FollowCpUser }, cpUser }) {
    if (!cpUser) throw new Error('Login required');
    return await FollowCpUser.follow(args.cpUserId, cpUser.userId);
  },
  async forumUnfollowCpUser(_, args, { models: { FollowCpUser }, cpUser }) {
    if (!cpUser) throw new Error('Login required');
    return await FollowCpUser.unfollow(args.cpUserId, cpUser.userId);
  }
};

export default followMutations;
