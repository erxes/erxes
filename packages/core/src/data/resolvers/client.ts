import { IContext } from '../../connectionResolver';
import { IClientDocument } from '../../db/models/definitions/client';

export default {
  async __resolveReference({ _id }, { models: { Clients } }: IContext) {
    return Clients.findOne({ _id });
  },

  async permissions(client: IClientDocument, _args, { models }: IContext) {
    const user = await models.Users.findOne({
      appId: client._id,
    });

    if (!user) {
      return [];
    }

    const permissions = await models.Permissions.find({
      userId: user._id,
    });

    // group permissions by module

    const groupedPermissions: { module: string; actions: string[] }[] =
      Object.entries(
        permissions.reduce(
          (acc, perm) => {
            if (!acc[perm.module]) {
              acc[perm.module] = [];
            }
            acc[perm.module].push(perm.action);
            return acc;
          },
          {} as Record<string, string[]>
        )
      ).map(([module, actions]) => ({ module, actions }));

    return groupedPermissions;
  },
};
