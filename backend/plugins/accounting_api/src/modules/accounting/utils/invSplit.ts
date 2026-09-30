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

const getSplitInfos = (transaction: ITransaction): IInvSplitDetailInfo[] => {
  const splitDetails = transaction.followInfos?.invSplitDetails;

  if (splitDetails == null) {
    return [];
  }

  if (!Array.isArray(splitDetails)) {
    throw new Error('Inventory split details must be an array');
  }

  return splitDetails.map((splitInfo, index) => {
    const detailId = splitInfo?.detailId;
    const productId = splitInfo?.productId;
    const ratio = Number(splitInfo?.ratio);

    if (!detailId || !productId || !Number.isFinite(ratio) || ratio <= 0) {
      throw new Error(`Invalid inventory split detail at index ${index}`);
    }

    return { detailId, productId, ratio };
  });
};

const getCommonFollowDoc = (
  originTransaction: ITransactionDocument,
  incomeTransaction: ITransactionDocument,
) => ({
  ptrId: originTransaction.ptrId,
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
): ITransaction[] => {
  const splitInfos = getSplitInfos(originTransaction);
  const detailsById = new Map(
    incomeTransaction.details.map((detail) => [
      detail.originId || detail._id,
      detail,
    ]),
  );
  const outDetails: ITrDetail[] = [];
  const incomeDetails: ITrDetail[] = [];

  for (const splitInfo of splitInfos) {
    const detail = detailsById.get(splitInfo.detailId);
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
      originId: splitInfo.detailId,
      originType: TR_DETAIL_FOLLOW_TYPES.INV_SPLIT_OUT,
      accountId: detail.accountId,
      productId: detail.productId,
      count: sourceCount,
      unitPrice: sourceUnitPrice,
      amount,
    });
    incomeDetails.push({
      _id: nanoid(),
      originId: splitInfo.detailId,
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

  const commonDoc = getCommonFollowDoc(originTransaction, incomeTransaction);
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
  const followDocs = buildInvSplitFollowDocs(
    originTransaction,
    incomeTransaction,
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
