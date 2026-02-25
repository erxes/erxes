import { IRoleDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export default {
  __resolveReference: async (
    { userId }: { userId: string },
    { models }: IContext,
  ) => {
    const { role } = await models.Roles.getRole(userId);

    return role;
  },

  user: async (role: IRoleDocument) => {
    if (!role.userId) {
      return;
    }

    return { __typename: 'User', _id: role.userId };
  },
};
