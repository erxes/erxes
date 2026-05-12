import { IContext } from '~/connectionResolvers';
import { IPermissionDocument } from '@/accounting/@types/permission';
import { checkAccountingPermission } from '../../../services/permissionChecker';
import { makeGetUserLevel } from '../../../utils/getUserLevel';

// Constants & Types
const ALLOWED_READS = new Set(['none', 'own', 'ltLvl', 'lteLvl', 'gtLvl']);
const ALLOWED_WRITES = new Set(['none', 'add', 'own', 'ltLvl', 'lteLvl', 'gtLvl']);

interface PermissionInput {
  accountIds: string[];
  userId: string;
  level?: number;
  read?: string;
  write?: string;
}

//Helper Functions 

function validatePermissionInput(input: PermissionInput) {
  if (input.level !== undefined && (!Number.isInteger(input.level) || input.level < 0)) {
    throw new Error('Level must be a non-negative integer');
  }
  if (input.read && !ALLOWED_READS.has(input.read)) {
    throw new Error(`Invalid read permission: ${input.read}`);
  }
  if (input.write && !ALLOWED_WRITES.has(input.write)) {
    throw new Error(`Invalid write permission: ${input.write}`);
  }
}

async function checkCanManagePermission(
  actorId: string,
  accountId: string,
  requestedLevel: number,
  models: any,
  getUserLevel: (userId: string) => Promise<number>,
) {
  const perm = await checkAccountingPermission(
    actorId,
    accountId,
    {},
    { Permissions: models.Permissions, Configs: models.Configs as any },
    getUserLevel,
  );
  if (!perm.canWrite) {
    throw new Error(`You do not have permission to set permissions on account ${accountId}`);
  }

  // Dominant users have no restrictions
  const writeConfig = await models.Configs.findOne({
    code: 'accountingDominantWrite',
    subId: accountId,
  }).lean();
  const dominantUsers = (writeConfig as any)?.value?.userIds ?? [];
  if (dominantUsers.includes(actorId)) return;

  const actorPermission = await models.Permissions.findOne({
    userId: actorId,
    accountId,
  }).lean();
  const actorLevel = actorPermission?.level ?? 0;

  if (requestedLevel > actorLevel) {
    throw new Error('You cannot grant a level higher than your own');
  }

  // If the actor's write scope is 'own', they cannot change the level at all
  if (actorPermission?.write === 'own' && requestedLevel !== actorLevel) {
    throw new Error('You can only modify your own permission level');
  }
}

async function processAccountPermission(
  accountId: string,
  userId: string,
  read: string,
  write: string,
  level: number | undefined,
  models: any,
): Promise<{ accountId: string; status: string }> {
  const effectiveRead = read || 'none';
  const effectiveWrite = write || 'none';

  let existing: IPermissionDocument | null = null;
  try {
    existing = await models.Permissions.findOne({ userId, accountId }).lean();
  } catch (e) {
    throw new Error(`Failed to fetch permission for user ${userId} on account ${accountId}`);
  }

  if (effectiveRead === 'none' && effectiveWrite === 'none') {
    if (existing) {
      await models.Permissions.removePermissions([existing._id]);
      return { accountId, status: 'deleted' };
    }
    return { accountId, status: 'no_op' };
  }

  const updateDoc: any = {
    userId,
    accountId,
    read: effectiveRead,
    write: effectiveWrite,
    updatedAt: new Date(),
  };

  if (level !== undefined) {
    updateDoc.level = level;
  } else if (existing) {
    updateDoc.level = existing.level;
  } else {
    updateDoc.level = 0;
  }

  if (!existing) {
    await models.Permissions.createPermission(updateDoc);
    return { accountId, status: 'created' };
  } else {
    await models.Permissions.updatePermission(existing._id, updateDoc);
    return { accountId, status: 'updated' };
  }
}

// ---------- GraphQL Mutation ----------

const permissionMutations = {
  async setAccountPermissions(
    _root,
    { input }: { input: PermissionInput },
    { models, user, subdomain }: IContext,
  ) {
    const { accountIds, userId, read, write, level } = input;

    validatePermissionInput(input);

    const getUserLevel = makeGetUserLevel(subdomain);
    const results: Array<{ accountId: string; status: string }> = [];

    for (const accountId of accountIds) {
      await checkCanManagePermission(
        user._id,
        accountId,
        level ?? 0,
        models,
        getUserLevel,
      );
    }

    for (const accountId of accountIds) {
      const result = await processAccountPermission(
        accountId,
        userId,
        read ?? 'none',
        write ?? 'none',
        level,
        models,
      );
      results.push(result);
    }

    return results;
  },
};

export const PermissionMutations = permissionMutations;