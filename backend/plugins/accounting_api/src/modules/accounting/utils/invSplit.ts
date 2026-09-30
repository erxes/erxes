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

type TEnabledInvSplitInfo = Extract<IInvSplitDetailInfo, { hasSplit: true }>;

const getSplitInfo = (
  detail: ITrDetail,
  index: number,
): TEnabledInvSplitInfo | undefined => {
  const splitInfo = detail.followInfos?.invSplit;

  if (splitInfo == null) {
    return undefined;
  }

  if (typeof splitInfo !== 'object' || Array.isArray(splitInfo)) {
    throw new Error(`Invalid inventory split detail at index ${index}`);
  }

  if (typeof splitInfo.hasSplit !== 'boolean') {
    throw new Error(`Invalid inventory split detail at index ${index}`);
  }

  if (!splitInfo.hasSplit) {
    return undefined;
  }

  const productId = splitInfo?.productId;
  const ratio = Number(splitInfo?.ratio);

  if (!productId || !Number.isFinite(ratio) || ratio <= 0) {
    throw new Error(`Invalid inventory split detail at index ${index}`);
  }

  return { hasSplit: true, productId, ratio };
};

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
    const splitInfo = getSplitInfo(sourceDetail, index);
    if (!splitInfo) {
      continue;
    }
    if (!sourceDetail._id) {
      throw new Error(
        `Inventory split source detail is missing at index ${index}`,
      );
    }

    const detail = detailsById.get(sourceDetail._id);
    if (!detail) {
      continue;
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
      _id: nanoid(),
      originId: sourceDetail._id,
      originType: TR_DETAIL_FOLLOW_TYPES.INV_SPLIT_OUT,
      accountId: detail.accountId,
      productId: detail.productId,
      count: sourceCount,
      unitPrice: sourceUnitPrice,
      amount,
    });
    incomeDetails.push({
      _id: nanoid(),
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
  const ptrId =
    oldFollowTrs.find(
      (transaction) =>
        transaction.ptrId && transaction.ptrId !== originTransaction.ptrId,
    )?.ptrId || nanoid();
  const followDocs = buildInvSplitFollowDocs(
    originTransaction,
    incomeTransaction,
    ptrId,
  );
  const savedFollowTrs: ITransactionDocument[] = [];

  for (const followDoc of followDocs) {
    const oldFollowTr = oldFollowTrs.find(
      (transaction) => transaction.originType === followDoc.originType,
    );
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
    savedFollowTrs.push(savedFollowTr);
  }

  const retainedTypes = new Set(followDocs.map((doc) => doc.originType));
  const removedFollowTrs = oldFollowTrs.filter(
    (transaction) => !retainedTypes.has(transaction.originType),
  );
  for (const oldFollowTr of removedFollowTrs) {
    const multiplier =
      oldFollowTr.originType === TR_FOLLOW_TYPES.INV_SPLIT_OUT ? -1 : 1;
    await removeSyncProductsInventory(subdomain, oldFollowTr, multiplier);
  }
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

  for (const followTr of followTrs) {
    const multiplier =
      followTr.originType === TR_FOLLOW_TYPES.INV_SPLIT_OUT ? -1 : 1;
    await removeSyncProductsInventory(subdomain, followTr, multiplier);
  }
};

export const isInvSplitFollow = (transaction: ITransaction) =>
  SPLIT_FOLLOW_TYPES.includes(transaction.originType || '');
