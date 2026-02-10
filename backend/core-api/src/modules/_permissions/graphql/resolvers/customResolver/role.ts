import { IRoleDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export default {
  user: async (role: IRoleDocument) => {
    if (!role.userId) {
      return;
    }

    return { __typename: 'User', _id: role.userId };
  },
};
