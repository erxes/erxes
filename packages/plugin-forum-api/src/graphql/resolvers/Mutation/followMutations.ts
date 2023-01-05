import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { LoginRequiredError } from '../../../customErrors';

const followMutations: IObjectTypeResolver<any, IContext> = {
  async forumFollowCpUser(_, args, { models: { FollowCpUser }, cpUser }) {
    if (!cpUser) throw new LoginRequiredError();
    return await FollowCpUser.follow(args.cpUserId, cpUser.userId);
  },
  async forumUnfollowCpUser(_, args, { models: { FollowCpUser }, cpUser }) {
    if (!cpUser) throw new LoginRequiredError();
    return await FollowCpUser.unfollow(args.cpUserId, cpUser.userId);
  },
  async forumFollowTag(_, { tagId }, { models: { FollowTag }, cpUser }) {
    if (!cpUser) throw new LoginRequiredError();
    return await FollowTag.follow(tagId, cpUser?.userId);
  },
  async forumFollowTags(_, { tagIds }, { models: { FollowTag }, cpUser }) {
    if (!cpUser) throw new LoginRequiredError();
    return await FollowTag.followMany(tagIds, cpUser?.userId);
  },
  async forumUnfollowTag(_, { tagId }, { models: { FollowTag }, cpUser }) {
    if (!cpUser) throw new LoginRequiredError();
    return await FollowTag.unfollow(tagId, cpUser?.userId);
  }
};

export default followMutations;
