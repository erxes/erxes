import { requireLogin } from 'erxes-api-shared/core-modules';
import { IRole } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const roleMutations = {
  async rolesUpsert(_root: undefined, doc: IRole, { models, user }: IContext) {
    const { userId } = doc || {};

    const role = await models.Roles.findOne({ userId }).lean();

    if (role) {
      return await models.Roles.updateRole(doc, user);
    }

    return await models.Roles.createRole(doc, user);
  },
};

requireLogin(roleMutations, 'rolesUpsert');
