import { IContext } from '~/connectionResolvers';

const permissionMutations = {
  async setAccountPermissions(
    _root,
    { input }: { input: { accountIds: string[]; userId: string; level?: number; read?: string; write?: string } },
    { models, checkPermission }: IContext,
  ) {
    // Global permission check
    await checkPermission('manageAccountPermissions');

    const { accountIds, userId, level, read, write } = input;
    const results: Array<{ accountId: string; status: string }> = [];

    const bulkOps: any[] = [];
    const deleteConditions: any[] = [];

    for (const accountId of accountIds) {
      const effectiveRead = read ?? 'none';
      const effectiveWrite = write ?? 'none';

      if (effectiveRead === 'none' && effectiveWrite === 'none') {
        deleteConditions.push({ userId, accountId });
        results.push({ accountId, status: 'deleted' });
      } else {
        const updateDoc = {
          $set: {
            userId,
            accountId,
            level: level ?? 0,
            read: effectiveRead,
            write: effectiveWrite,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        };
        bulkOps.push({
          updateOne: {
            filter: { userId, accountId },
            update: updateDoc,
            upsert: true,
          },
        });
        results.push({ accountId, status: 'success' });
      }
    }

    if (bulkOps.length) {
      await models.Permissions.bulkWrite(bulkOps);
    }
    if (deleteConditions.length) {
      await models.Permissions.deleteMany({ $or: deleteConditions });
    }

    return results;
  },
};

export const PermissionMutations = permissionMutations;