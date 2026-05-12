import { IContext } from '~/connectionResolvers';
import { IPermissionDocument } from '@/accounting/@types/permission';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

const permissionMutations = {
  async setAccountPermissions(
    _root,
    { input }: { input: { accountIds: string[]; userId: string; level?: number; read?: string; write?: string } },
    { models, user, subdomain }: IContext,
  ) {
    const { accountIds, userId, level, read, write } = input;
    const results: Array<{ accountId: string; status: string }> = [];

    // Verify the caller has write permission on each account
    const getUserLevel = makeGetUserLevel(subdomain);
    for (const accountId of accountIds) {
      const { canWrite } = await checkAccountingPermission(
        user._id,
        accountId,
        {},
        { Permissions: models.Permissions, Configs: models.Configs as any },
        getUserLevel,
      );
      if (!canWrite) {
        throw new Error(`You do not have permission to set permissions on account ${accountId}`);
      }
    }

    // Prepare bulk operations
    const bulkOps: any[] = [];
    const deleteConditions: any[] = [];

    for (const accountId of accountIds) {
      const effectiveRead = read ?? 'none';
      const effectiveWrite = write ?? 'none';

      if (effectiveRead === 'none' && effectiveWrite === 'none') {
        // Mark for deletion
        deleteConditions.push({ userId, accountId });
        results.push({ accountId, status: 'deleted' });
      } else {
        // Prepare upsert operation
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

    // Execute bulk write for upserts
    if (bulkOps.length) {
      await models.Permissions.bulkWrite(bulkOps);
    }

    // Execute bulk delete
    if (deleteConditions.length) {
      await models.Permissions.deleteMany({ $or: deleteConditions });
    }

    return results;
  },
};

export const PermissionMutations = permissionMutations;