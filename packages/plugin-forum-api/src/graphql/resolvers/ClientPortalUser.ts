import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IForumClientPortalUser } from '../../db/models/forumClientPortalUser';

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
  }
};

export default ClientPortalUser;
