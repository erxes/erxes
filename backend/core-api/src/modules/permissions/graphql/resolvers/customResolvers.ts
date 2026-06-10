import { IContext } from '~/connectionResolvers';

const memberResolver =
  (idField: 'id' | '_id') =>
  async (group: Record<string, string>, _args: unknown, { models }: IContext) =>
    models.Users.find({ permissionGroupIds: group[idField] }).sort({
      'details.firstName': 1,
    });

export default {
  PermissionGroup: {
    members: memberResolver('_id'),
  },
  DefaultPermissionGroup: {
    members: memberResolver('id'),
  },
};
