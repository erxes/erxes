import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_DETAIL_FOLLOW_TYPES,
  TR_FOLLOW_TYPES,
  TR_SIDES,
} from '../@types/constants';
import {
  IInvSplitDetailInfo,
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import {
  createOrUpdateTr,
  removeSyncProductsInventory,
  syncProductsInventory,
} from './utils';

const SPLIT_FOLLOW_TYPES = [
  TR_FOLLOW_TYPES.INV_SPLIT_OUT,
  TR_FOLLOW_TYPES.INV_SPLIT_INCOME,
];

type TLegacyInvSplitInfo = {
  detailId?: string;
  productId?: string;
  ratio?: number;
};
type TExistingInvSplitFollowDocs = {
  out?: ITransactionDocument;
  income?: ITransactionDocument;
};

const toRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

export const parseInvSplitInfo = (
  value: unknown,
  errorMessage = 'Invalid inventory split detail',
): IInvSplitDetailInfo | undefined => {
  if (value == null) {
    return undefined;
  }

  const splitInfo = toRecord(value);
  if (!splitInfo || typeof splitInfo.hasSplit !== 'boolean') {
    throw new Error(errorMessage);
  }

  if (splitInfo.hasSplit === false) {
    return { hasSplit: false };
  }

  const productId = splitInfo.productId;
  const ratio = Number(splitInfo.ratio);

  if (
    typeof productId !== 'string' ||
    !productId ||
    !Number.isFinite(ratio) ||
    ratio <= 0
  ) {
    throw new Error(errorMessage);
  }

  return { hasSplit: true, productId, ratio };
};

const normalizeStoredInvSplitInfo = (
  currentValue: unknown,
  legacyValue?: TLegacyInvSplitInfo,
) => {
  const currentInfo = toRecord(currentValue);
  if (currentInfo) {
    return parseInvSplitInfo({
      ...currentInfo,
      hasSplit:
        typeof currentInfo.hasSplit === 'boolean'
          ? currentInfo.hasSplit
          : Boolean(currentInfo.productId),
    });
  }

  if (!legacyValue) {
    return undefined;
  }

  return parseInvSplitInfo({
    hasSplit: true,
    productId: legacyValue.productId,
    ratio: legacyValue.ratio,
  });
};

export const normalizeInvSplitTransaction = (
  transaction: ITransaction,
): ITransaction => {
  if (![JOURNALS.INV_INCOME, JOURNALS.INV_MOVE].includes(transaction.journal)) {
    return transaction;
  }

  const followInfos = { ...transaction.followInfos };
  const legacySplitInfos = Array.isArray(followInfos.invSplitDetails)
    ? (followInfos.invSplitDetails as TLegacyInvSplitInfo[])
    : [];
  delete followInfos.invSplitDetails;

  return {
    ...transaction,
    followInfos,
    details: transaction.details.map((detail) => {
      const legacyInfo = legacySplitInfos.find(
        (splitInfo) => splitInfo.detailId === detail._id,
      );
      const invSplit = normalizeStoredInvSplitInfo(
        detail.followInfos?.invSplit,
        legacyInfo,
      );

      if (!invSplit) {
        return detail;
      }

      return {
        ...detail,
        followInfos: {
          ...detail.followInfos,
          invSplit,
        },
      };
    }),
  };
};

const findExistingDetailId = (
  transaction: ITransactionDocument | undefined,
  originId: string,
) =>
  transaction?.details.find((detail) => detail.originId === originId)?._id ||
  nanoid();

const getCommonFollowDoc = (
  originTransaction: ITransactionDocument,
  incomeTransaction: ITransactionDocument,
  ptrId: string,
) => ({
  ptrId,
  parentId: originTransaction.parentId,
  originId: originTransaction._id,
  number: originTransaction.number,
  date: originTransaction.date,
  description: originTransaction.description,
  status: originTransaction.status,
  mentionOwnerId: originTransaction.mentionOwnerId,
  mentionUserIds: originTransaction.mentionUserIds,
  branchId: incomeTransaction.branchId,
  departmentId: incomeTransaction.departmentId,
  customerType: originTransaction.customerType,
  customerId: originTransaction.customerId,
});

export const buildInvSplitFollowDocs = (
  originTransaction: ITransactionDocument,
  incomeTransaction: ITransactionDocument,
  ptrId: string,
  existingFollowDocs: TExistingInvSplitFollowDocs = {},
): ITransaction[] => {
  const detailsById = new Map(
    incomeTransaction.details.map((detail) => [
      detail.originId || detail._id,
      detail,
    ]),
  );
  const outDetails: ITrDetail[] = [];
  const incomeDetails: ITrDetail[] = [];

  for (const [index, sourceDetail] of originTransaction.details.entries()) {
    const splitInfo = parseInvSplitInfo(
      sourceDetail.followInfos?.invSplit,
      `Invalid inventory split detail at index ${index}`,
    );
    if (!splitInfo?.hasSplit) {
      continue;
    }
    if (!sourceDetail._id) {
      throw new Error(
        `Inventory split source detail is missing at index ${index}`,
      );
    }

    const detail = detailsById.get(sourceDetail._id);
    if (!detail) {
      throw new Error(
        `Inventory split income detail not found: ${sourceDetail._id}`,
      );
    }
    if (detail.productId === splitInfo.productId) {
      throw new Error('Split product must differ from the source product');
    }

    const splitCount = fixNum((detail.count ?? 0) * splitInfo.ratio, 4);
    if (splitCount <= 0) {
      throw new Error('Split product count must be greater than zero');
    }

    const amount =
      detail.amount ?? fixNum((detail.count ?? 0) * (detail.unitPrice ?? 0), 4);
    const sourceCount = detail.count ?? 0;
    const sourceUnitPrice = sourceCount ? fixNum(amount / sourceCount, 4) : 0;
    outDetails.push({
      _id: findExistingDetailId(existingFollowDocs.out, sourceDetail._id),
      originId: sourceDetail._id,
      originType: TR_DETAIL_FOLLOW_TYPES.INV_SPLIT_OUT,
      accountId: detail.accountId,
      productId: detail.productId,
      count: sourceCount,
      unitPrice: sourceUnitPrice,
      amount,
    });
    incomeDetails.push({
      _id: findExistingDetailId(existingFollowDocs.income, sourceDetail._id),
      originId: sourceDetail._id,
      originType: TR_DETAIL_FOLLOW_TYPES.INV_SPLIT_INCOME,
      accountId: detail.accountId,
      productId: splitInfo.productId,
      count: splitCount,
      unitPrice: fixNum(amount / splitCount, 4),
      amount,
    });
  }

  if (!outDetails.length) {
    return [];
  }

  const commonDoc = getCommonFollowDoc(
    originTransaction,
    incomeTransaction,
    ptrId,
  );
  return [
    {
      ...commonDoc,
      journal: JOURNALS.INV_OUT,
      side: TR_SIDES.CREDIT,
      originType: TR_FOLLOW_TYPES.INV_SPLIT_OUT,
      details: outDetails,
    },
    {
      ...commonDoc,
      journal: JOURNALS.INV_INCOME,
      side: TR_SIDES.DEBIT,
      originType: TR_FOLLOW_TYPES.INV_SPLIT_INCOME,
      details: incomeDetails,
    },
  ];
};

const reverseInvSplitTransactions = async (
  subdomain: string,
  transactions: ITransactionDocument[],
) =>
  transactions.reduce<Promise<void>>(
    (pending, transaction) =>
      pending.then(() => {
        const multiplier =
          transaction.originType === TR_FOLLOW_TYPES.INV_SPLIT_OUT ? -1 : 1;
        return removeSyncProductsInventory(subdomain, transaction, multiplier);
      }),
    Promise.resolve(),
  );

const saveAndSyncInvSplitFollowTr = async ({
  subdomain,
  models,
  userId,
  followDoc,
  oldFollowTr,
}: {
  subdomain: string;
  models: IModels;
  userId: string;
  followDoc: ITransaction;
  oldFollowTr?: ITransactionDocument;
}) => {
  const savedFollowTr = await createOrUpdateTr(
    models,
    userId,
    followDoc,
    oldFollowTr,
  );
  const multiplier =
    followDoc.originType === TR_FOLLOW_TYPES.INV_SPLIT_OUT ? -1 : 1;
  await syncProductsInventory(
    subdomain,
    savedFollowTr,
    oldFollowTr,
    multiplier,
  );

  return savedFollowTr;
};

const selectCurrentFollowDocs = (transactions: ITransactionDocument[]) => {
  const current: TExistingInvSplitFollowDocs = {};
  const duplicates: ITransactionDocument[] = [];

  for (const transaction of transactions) {
    const key =
      transaction.originType === TR_FOLLOW_TYPES.INV_SPLIT_OUT
        ? 'out'
        : 'income';
    if (current[key]) {
      duplicates.push(transaction);
    } else {
      current[key] = transaction;
    }
  }

  return { current, duplicates };
};

export const syncInvSplitFollowTrs = async (
  subdomain: string,
  models: IModels,
  userId: string,
  originTransaction: ITransactionDocument,
  incomeTransaction: ITransactionDocument,
) => {
  const oldFollowTrs = await models.Transactions.find({
    originId: originTransaction._id,
    originType: { $in: SPLIT_FOLLOW_TYPES },
  }).lean();
  const { current, duplicates } = selectCurrentFollowDocs(oldFollowTrs);
  if (duplicates.length) {
    await reverseInvSplitTransactions(subdomain, duplicates);
    await models.Transactions.deleteMany({
      _id: { $in: duplicates.map((transaction) => transaction._id) },
    });
  }

  const currentFollowTrs = [current.out, current.income].filter(
    (transaction): transaction is ITransactionDocument => Boolean(transaction),
  );
  const ptrId =
    currentFollowTrs.find(
      (transaction) =>
        transaction.ptrId && transaction.ptrId !== originTransaction.ptrId,
    )?.ptrId || nanoid();
  const followDocs = buildInvSplitFollowDocs(
    originTransaction,
    incomeTransaction,
    ptrId,
    current,
  );
  const savedFollowTrs = await followDocs.reduce<
    Promise<ITransactionDocument[]>
  >(
    (pending, followDoc) =>
      pending.then((savedTransactions) => {
        const oldFollowTr =
          followDoc.originType === TR_FOLLOW_TYPES.INV_SPLIT_OUT
            ? current.out
            : current.income;

        return saveAndSyncInvSplitFollowTr({
          subdomain,
          models,
          userId,
          followDoc,
          oldFollowTr,
        }).then((savedFollowTr) => [
          ...savedTransactions,
          savedFollowTr,
        ]);
      }),
    Promise.resolve([]),
  );

  const retainedTypes = new Set(followDocs.map((doc) => doc.originType));
  const removedFollowTrs = currentFollowTrs.filter(
    (transaction) => !retainedTypes.has(transaction.originType),
  );
  await reverseInvSplitTransactions(subdomain, removedFollowTrs);
  if (removedFollowTrs.length) {
    await models.Transactions.deleteMany({
      _id: { $in: removedFollowTrs.map((transaction) => transaction._id) },
    });
  }

  return savedFollowTrs;
};

export const removeInvSplitFollowTrs = async (
  subdomain: string,
  models: IModels,
  originTransactionId: string,
) => {
  const followTrs = await models.Transactions.find({
    originId: originTransactionId,
    originType: { $in: SPLIT_FOLLOW_TYPES },
  }).lean();
  await reverseInvSplitTransactions(subdomain, followTrs);
};

export const isInvSplitFollow = (transaction: ITransaction) =>
  SPLIT_FOLLOW_TYPES.includes(transaction.originType || '');
