import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  ITransactionDocument,
  IHiddenTransaction,
  ITransaction,
} from '../@types/transaction';
import {
  ACCOUNT_PERMISSION_SCOPES,
  ACCOUNT_PERMISSION_WRITE_SCOPES,
} from '../@types/permission';

const READ_SCOPE_BY_RATE = Object.entries(
  ACCOUNT_PERMISSION_SCOPES.RATE,
).reduce((acc, [scope, rate]) => ({ ...acc, [rate]: scope }), {}) as Record<
  number,
  string
>;

const getConfigUserIds = (config: any) => {
  if (Array.isArray(config?.value)) {
    return config.value;
  }

  return config?.value?.userIds || [];
};

const collectAccountIdsFromTrDocs = (docs: ITransaction[]) => {
  const accountIds = docs.flatMap((doc) =>
    (doc.details || []).map((detail) => detail.accountId).filter(Boolean),
  );

  return [...new Set(accountIds)];
};

const getTransactionOwnerId = (transaction?: ITransaction) =>
  transaction?.modifiedBy || transaction?.createdBy;

const getPermissionKey = (userId: string, accountId: string) =>
  `${userId}:${accountId}`;

const canWriteExistingTransaction = ({
  write,
  currentLevel,
  targetLevel,
  isOwn,
}: {
  write: string;
  currentLevel: number;
  targetLevel: number;
  isOwn: boolean;
}) => {
  if (
    write === ACCOUNT_PERMISSION_WRITE_SCOPES.NONE ||
    write === ACCOUNT_PERMISSION_WRITE_SCOPES.ADD
  ) {
    return false;
  }

  if (write === ACCOUNT_PERMISSION_WRITE_SCOPES.OWN) {
    return isOwn;
  }

  if (write === ACCOUNT_PERMISSION_WRITE_SCOPES.LT_LVL) {
    return targetLevel > currentLevel;
  }

  if (write === ACCOUNT_PERMISSION_WRITE_SCOPES.LTE_LVL) {
    return targetLevel >= currentLevel;
  }

  return write === ACCOUNT_PERMISSION_WRITE_SCOPES.GT_LVL;
};

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

const canReadExistingTransaction = ({
  read,
  currentLevel,
  targetLevel,
  isOwn,
}: {
  read: string;
  currentLevel: number;
  targetLevel: number;
  isOwn: boolean;
}) => {
  if (read === ACCOUNT_PERMISSION_SCOPES.NONE) {
    return false;
  }

  if (read === ACCOUNT_PERMISSION_SCOPES.OWN) {
    return isOwn;
  }

  if (read === ACCOUNT_PERMISSION_SCOPES.LT_LVL) {
    return targetLevel > currentLevel;
  }

  if (read === ACCOUNT_PERMISSION_SCOPES.LTE_LVL) {
    return targetLevel >= currentLevel;
  }

  return read === ACCOUNT_PERMISSION_SCOPES.GT_LVL;
};

export const assertCanWriteTransactionAccounts = async ({
  models,
  docs,
  userId,
  oldTrs,
}: {
  models: IModels;
  docs: ITransaction[];
  userId: string;
  oldTrs?: ITransaction[];
}) => {
  const oldTrById = new Map((oldTrs || []).map((tr) => [tr._id, tr]));
  const oldAccountIds = (oldTrs || []).flatMap((tr) =>
    (tr.details || []).map((detail) => detail.accountId).filter(Boolean),
  );
  const accountIds = [
    ...new Set([...collectAccountIdsFromTrDocs(docs), ...oldAccountIds]),
  ];

  if (!accountIds.length) {
    return;
  }

  const dominantWriteConfig = await models.Configs.findOne({
    code: 'dominantWriteAccountUsers',
    subId: '',
  }).lean();

  if (getConfigUserIds(dominantWriteConfig).includes(userId)) {
    return;
  }

  const permissions = await models.Permissions.find({
    userId,
    accountId: { $in: accountIds },
    write: { $ne: ACCOUNT_PERMISSION_WRITE_SCOPES.NONE },
  })
    .select({ accountId: 1, write: 1, level: 1 })
    .lean();

  const permissionByAccountId = new Map(
    permissions.map((perm) => [perm.accountId, perm]),
  );
  const targetUserIds = [
    ...new Set(
      (oldTrs || []).map((tr) => getTransactionOwnerId(tr)).filter(Boolean),
    ),
  ];
  const targetPermissions = targetUserIds.length
    ? await models.Permissions.find({
        userId: { $in: targetUserIds },
        accountId: { $in: accountIds },
      })
        .select({ userId: 1, accountId: 1, level: 1 })
        .lean()
    : [];
  const targetPermissionByUserAndAccount = new Map(
    targetPermissions.map((perm) => [
      getPermissionKey(perm.userId, perm.accountId),
      perm,
    ]),
  );

  const deniedAccountIds = new Set<string>();

  for (const doc of docs) {
    const oldTr = oldTrById.get(doc._id || '');
    const targetUserId = getTransactionOwnerId(oldTr);
    const docAccountIds = [
      ...new Set([
        ...(doc.details || [])
          .map((detail) => detail.accountId)
          .filter(Boolean),
        ...((oldTr?.details || [])
          .map((detail) => detail.accountId)
          .filter(Boolean) || []),
      ]),
    ];

    for (const accountId of docAccountIds) {
      const currentPermission = permissionByAccountId.get(accountId);

      if (!currentPermission) {
        deniedAccountIds.add(accountId);
        continue;
      }

      if (!oldTr) {
        continue;
      }

      const isOwn = targetUserId === userId;
      const targetLevel =
        targetPermissionByUserAndAccount.get(
          getPermissionKey(targetUserId || '', accountId),
        )?.level ?? 0;

      if (
        !canWriteExistingTransaction({
          write: currentPermission.write,
          currentLevel: currentPermission.level ?? 0,
          targetLevel,
          isOwn,
        })
      ) {
        deniedAccountIds.add(accountId);
      }
    }
  }

  if (deniedAccountIds.size) {
    throw new Error(
      `Account write permission denied: ${[...deniedAccountIds].join(', ')}`,
    );
  }
};

const convertToHidden = (transaction: ITransactionDocument) => {
  return {
    _id: transaction._id,
    parentId: transaction.parentId,
    ptrId: transaction.ptrId,
    ptrStatus: transaction.ptrStatus,
    journal: transaction.journal,
    originId: transaction.originId,
    originType: transaction.originType,
    details: transaction.details.map((detail) => ({
      _id: detail._id,
      originId: detail.originId,
    })),
    sumDt: transaction.sumDt,
    sumCt: transaction.sumCt,
    permission: 'hidden',
  } as IHiddenTransaction;
};

const convertToWithPerm = (transaction: ITransactionDocument, perm: string) => {
  transaction.permission = perm;
  return transaction;
};

const canShowTr = async (
  models: IModels,
  transaction: ITransactionDocument,
  user: IUserDocument,
) => {
  // hidden, readOnly, update, delete|full|null
  if (!user._id) {
    return 'hidden';
  }

  if (user.isOwner) {
    return;
  }

  const accountIds = [
    ...new Set(
      (transaction.details || [])
        .map((detail) => detail.accountId)
        .filter(Boolean),
    ),
  ];

  if (!accountIds.length) {
    return;
  }

  const dominantConfigs = await models.Configs.find({
    code: { $in: ['dominantReadAccountUsers', 'dominantWriteAccountUsers'] },
    subId: '',
  }).lean();

  if (
    dominantConfigs.some((config) =>
      getConfigUserIds(config).includes(user._id),
    )
  ) {
    return;
  }

  const permissions = await models.Permissions.find({
    userId: user._id,
    accountId: { $in: accountIds },
  })
    .select({ accountId: 1, read: 1, write: 1, level: 1 })
    .lean();
  const permissionByAccountId = new Map(
    permissions.map((perm) => [perm.accountId, perm]),
  );

  const targetUserId = getTransactionOwnerId(transaction);
  const targetPermissions = targetUserId
    ? await models.Permissions.find({
        userId: targetUserId,
        accountId: { $in: accountIds },
      })
        .select({ accountId: 1, level: 1 })
        .lean()
    : [];
  const targetLevelByAccountId = new Map(
    targetPermissions.map((perm) => [perm.accountId, perm.level ?? 0]),
  );

  for (const accountId of accountIds) {
    const currentPermission = permissionByAccountId.get(accountId);

    if (!currentPermission) {
      return 'hidden';
    }

    const effectiveRead = normalizeReadByWrite({
      read: currentPermission.read || ACCOUNT_PERMISSION_SCOPES.NONE,
      write: currentPermission.write || ACCOUNT_PERMISSION_WRITE_SCOPES.NONE,
    });

    if (
      !canReadExistingTransaction({
        read: effectiveRead,
        currentLevel: currentPermission.level ?? 0,
        targetLevel: targetLevelByAccountId.get(accountId) ?? 0,
        isOwn: targetUserId === user._id,
      })
    ) {
      return 'hidden';
    }
  }
};

export const checkPermissionTrs = async (
  models: IModels,
  transactions: ITransactionDocument[],
  user: IUserDocument,
) => {
  const originTrs = transactions.filter((tr) => !tr.originId);
  const rootTrs = originTrs.length ? originTrs : transactions;

  const result: (ITransactionDocument | IHiddenTransaction)[] = [];

  for (const otr of rootTrs) {
    const permStr: string | undefined = await canShowTr(models, otr, user);

    if (permStr === 'hidden') {
      result.push(convertToHidden(otr));
      for (const atr of transactions.filter((tr) => tr.originId === otr._id)) {
        result.push(convertToHidden(atr));
      }
      continue;
    }

    if (permStr) {
      result.push(convertToWithPerm(otr, permStr));
      for (const atr of transactions.filter((tr) => tr.originId === otr._id)) {
        result.push(convertToWithPerm(atr, permStr));
      }
      continue;
    }

    // permStr in undefined || '' || null or full
    result.push(otr);
    for (const atr of transactions.filter((tr) => tr.originId === otr._id)) {
      result.push(atr);
    }
  }

  return result;
};
