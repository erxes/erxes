import { IContext } from '~/connectionResolvers';
import {
  ACCOUNT_PERMISSION_SCOPES,
  ACCOUNT_PERMISSION_WRITE_SCOPES,
} from '~/modules/accounting/@types/permission';

const READ_SCOPE_BY_RATE = Object.entries(
  ACCOUNT_PERMISSION_SCOPES.RATE,
).reduce((acc, [scope, rate]) => ({ ...acc, [rate]: scope }), {}) as Record<
  number,
  string
>;

const normalizeReadByWrite = ({
  read,
  write,
}: {
  read: string;
  write: string;
}) => {
  const readRate =
    (ACCOUNT_PERMISSION_SCOPES.RATE as Record<string, number>)[read] ?? 0;
  const writeRate =
    (ACCOUNT_PERMISSION_WRITE_SCOPES.RATE as Record<string, number>)[write] ??
    0;

  if (readRate >= writeRate) {
    return read;
  }

  return READ_SCOPE_BY_RATE[writeRate] || ACCOUNT_PERMISSION_SCOPES.NONE;
};

const accountPermissionsMutations = {
  async setAccountPermissions(
    _root,
    input: {
      accountIds: string[];
      userId: string;
      level?: number;
      read?: string;
      write?: string;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountPermissions');

    const { accountIds, userId, level, read, write } = input;

    const requestedRead = read ?? ACCOUNT_PERMISSION_SCOPES.NONE;
    const effectiveWrite = write ?? ACCOUNT_PERMISSION_WRITE_SCOPES.NONE;

    if (!ACCOUNT_PERMISSION_SCOPES.ALL.includes(requestedRead)) {
      throw new Error(
        `Invalid read scope: ${requestedRead}. Allowed: ${ACCOUNT_PERMISSION_SCOPES.ALL.join(
          ', ',
        )}`,
      );
    }
    if (!ACCOUNT_PERMISSION_WRITE_SCOPES.ALL.includes(effectiveWrite)) {
      throw new Error(
        `Invalid write scope: ${effectiveWrite}. Allowed: ${ACCOUNT_PERMISSION_WRITE_SCOPES.ALL.join(
          ', ',
        )}`,
      );
    }

    const effectiveRead = normalizeReadByWrite({
      read: requestedRead,
      write: effectiveWrite,
    });

    if (
      effectiveRead === ACCOUNT_PERMISSION_SCOPES.NONE &&
      effectiveWrite === ACCOUNT_PERMISSION_WRITE_SCOPES.NONE
    ) {
      await models.Permissions.deleteMany({
        userId,
        accountId: { $in: accountIds },
      });

      return accountIds.map((accId) => ({
        accountId: accId,
        status: 'deleted',
      }));
    }

    const bulkOps: any[] = [];
    const results: Array<{ accountId: string; status: string }> = [];

    for (const accountId of accountIds) {
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

    if (bulkOps.length) await models.Permissions.bulkWrite(bulkOps);

    return results;
  },
};

export default accountPermissionsMutations;
