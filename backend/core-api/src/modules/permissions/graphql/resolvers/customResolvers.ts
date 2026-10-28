import { IContext } from '~/connectionResolvers';
import { getGroupHolderIds } from '@/organization/structure/utils';

const memberResolver =
  (idField: 'id' | '_id') =>
  async (
    group: Record<string, string>,
    _args: unknown,
    { models }: IContext,
  ) => {
    const userIds = await getGroupHolderIds(models, group[idField]);

    return models.Users.find({ _id: { $in: userIds } }).sort({
      'details.firstName': 1,
    });
  };

export default {
  PermissionGroup: {
    members: memberResolver('_id'),
  },
  DefaultPermissionGroup: {
    members: memberResolver('id'),
  },
};
