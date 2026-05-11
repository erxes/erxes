import { IContext } from '~/connectionResolvers';
import { IPermissionDocument } from '@/accounting/@types/permission';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

const permissionMutations = {
  async setAccountPermissions(
    _root,
    { input }: { input: { accountIds: string[]; userId: string; level?: number; read?: string; write?: string } },
    { models, user, subdomain }: IContext,   // added user & subdomain
  ) {
    const { accountIds, userId, level, read, write } = input;
    const results: Array<{ accountId: string; status: string }> = [];

    // Authorization: the caller must have write permission on each accountId 
    const getUserLevel = makeGetUserLevel(subdomain);
    for (const accountId of accountIds) {
      const { canWrite } = await checkAccountingPermission(
        user._id,
        accountId,
        {}, // account‑level write check
        { Permissions: models.Permissions, Configs: models.Configs as any },
        getUserLevel,
      );
      if (!canWrite) {
        throw new Error(`You do not have permission to set permissions on account ${accountId}`);
      }
    }

    for (const accountId of accountIds) {
      const effectiveRead = read ?? 'none';
      const effectiveWrite = write ?? 'none';

      let existing: IPermissionDocument | null = null;
      try {
        existing = await models.Permissions.getPermission({ userId, accountId });
      } catch (e) {
        // not found
      }

      if (effectiveRead === 'none' && effectiveWrite === 'none') {
        if (existing) {
          await models.Permissions.removePermissions([existing._id]);
          results.push({ accountId, status: 'deleted' });
        } else {
          results.push({ accountId, status: 'no_op' });
        }
      } else {
        const updateDoc = {
          userId,
          accountId,
          level: level ?? 0,
          read: effectiveRead,
          write: effectiveWrite,
          updatedAt: new Date(),
        };
        if (!existing) {
          await models.Permissions.createPermission(updateDoc);
          results.push({ accountId, status: 'created' });
        } else {
          await models.Permissions.updatePermission(existing._id, updateDoc);
          results.push({ accountId, status: 'updated' });
        }
      }
    }
    return results;
  },
};

export const PermissionMutations = permissionMutations;