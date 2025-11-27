import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const cpUserQueries: Record<string, Resolver> = {
  async clientPortalCurrentUser(
    _root: unknown,
    _args: unknown,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    return cpUser ? models.CPUser.findOne({ _id: cpUser._id }) : null;
  },
};

cpUserQueries.clientPortalCurrentUser.wrapperConfig = {
  forClientPortal: true,
};
