import { IContext } from '~/connectionResolvers';

const queriesAccountPermissions = {
  async accountPermissions(
    _root,
    { userId, accountId }: { userId: string; accountId: string },
    { models }: IContext,
  ) {
    const permission = await models.Permissions.findOne({ userId, accountId }).lean();
    return permission;
  },
};

export const QueriesAccountPermissions = queriesAccountPermissions;