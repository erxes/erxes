import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  ACCOUNT_KINDS,
  TR_INVENTORY_STATUS_TYPES,
} from '@/accounting/@types/constants';
import { IModels } from '~/connectionResolvers';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';

export const createOrUpdateTr = async (
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
): Promise<ITransactionDocument> => {
  for (const detail of doc.details) {
    if (!detail.branchId) {
      detail.branchId = doc.branchId;
    }
    if (!detail.departmentId) {
      detail.departmentId = doc.departmentId;
    }
  }

  if (oldTr?._id) {
    return await models.Transactions.updateTransaction(
      oldTr._id,
      { ...doc },
      userId,
    );
  }

  return await models.Transactions.createTransaction({ ...doc }, userId);
};

export const getSingleJournalByAccount = (
  accJournal?: string,
  accKind?: string,
) => {
  switch (accJournal) {
    case ACCOUNT_JOURNALS.BANK:
      return JOURNALS.BANK;
    case ACCOUNT_JOURNALS.CASH:
      return JOURNALS.CASH;
    case ACCOUNT_JOURNALS.DEBT:
      if (accKind === ACCOUNT_KINDS.ACTIVE) {
        return JOURNALS.RECEIVABLE;
      } else {
        return JOURNALS.PAYABLE;
      }
    case ACCOUNT_JOURNALS.TAX:
      return JOURNALS.TAX;
    case ACCOUNT_JOURNALS.MAIN:
    default:
      return JOURNALS.MAIN;
  }
};

type TInventoryDiff = {
  diffCount: number;
  diffCost: number;
  diffSoonIn: number;
  diffSoonOut: number;
};

const emptyInventoryDiff = (): TInventoryDiff => ({
  diffCount: 0,
  diffCost: 0,
  diffSoonIn: 0,
  diffSoonOut: 0,
});

const getInventoryStatusType = (status?: string) => {
  if (TR_INVENTORY_STATUS_TYPES.REAL_STATUSES.includes(status || '')) {
    return TR_INVENTORY_STATUS_TYPES.REAL;
  }

  if (TR_INVENTORY_STATUS_TYPES.SOON_STATUSES.includes(status || '')) {
    return TR_INVENTORY_STATUS_TYPES.SOON;
  }

  return TR_INVENTORY_STATUS_TYPES.OMIT;
};

const addInventoryDiff = (
  diffsByProductId: Record<string, TInventoryDiff>,
  productId: string,
  diff: Partial<TInventoryDiff>,
) => {
  if (!productId) {
    return;
  }

  const current = diffsByProductId[productId] || emptyInventoryDiff();

  diffsByProductId[productId] = {
    diffCount: fixNum((current.diffCount ?? 0) + (diff.diffCount ?? 0), 6),
    diffCost: fixNum((current.diffCost ?? 0) + (diff.diffCost ?? 0), 6),
    diffSoonIn: fixNum((current.diffSoonIn ?? 0) + (diff.diffSoonIn ?? 0), 6),
    diffSoonOut: fixNum((current.diffSoonOut ?? 0) + (diff.diffSoonOut ?? 0), 6),
  };
};

const collectInventoryDiffs = (
  transaction: ITransactionDocument,
  multiplier: number,
  direction: 1 | -1,
) => {
  const diffsByProductId: Record<string, TInventoryDiff> = {};
  const statusType = getInventoryStatusType(transaction.status);
  const isIncome = multiplier > 0;

  if (statusType === TR_INVENTORY_STATUS_TYPES.OMIT) {
    return diffsByProductId;
  }

  for (const detail of transaction.details || []) {
    const productId = detail.productId || '';
    const count = detail.count || 0;
    const amount = detail.amount || 0;

    if (statusType === TR_INVENTORY_STATUS_TYPES.REAL) {
      addInventoryDiff(diffsByProductId, productId, {
        diffCount: direction * multiplier * count,
        diffCost: direction * multiplier * amount,
      });
      continue;
    }

    addInventoryDiff(diffsByProductId, productId, {
      diffSoonIn: isIncome ? direction * count : 0,
      diffSoonOut: isIncome ? 0 : direction * count,
    });
  }

  return diffsByProductId;
};

const mergeInventoryDiffs = (
  baseDiffs: Record<string, TInventoryDiff>,
  diffs: Record<string, TInventoryDiff>,
) => {
  for (const productId of Object.keys(diffs)) {
    addInventoryDiff(baseDiffs, productId, diffs[productId]);
  }
};

const hasInventoryDiff = (diff: TInventoryDiff) =>
  diff.diffCount || diff.diffCost || diff.diffSoonIn || diff.diffSoonOut;

const sendInventoryDiffs = (
  subdomain: string,
  branchId: string | undefined,
  departmentId: string | undefined,
  diffsByProductId: Record<string, TInventoryDiff>,
) => {
  const productsInfo = Object.keys(diffsByProductId)
    .filter((productId) => hasInventoryDiff(diffsByProductId[productId]))
    .map((productId) => ({
      productId,
      ...diffsByProductId[productId],
    }));

  if (!productsInfo.length) {
    return;
  }

  sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'core',
    module: 'products',
    action: 'increaseInventories',
    input: {
      branchId,
      departmentId,
      productsInfo,
    },
  });
};

/**
 * barimt create or update hamaarah baraanii uldegdel sync hiih
 * @param transaction: undsen barimt
 * @param oldTr?: huuchin baisan barimt
 * @param multiplier: orlogo bol 1, zarlaga bol -1
 */
export const syncProductsInventory = async (
  subdomain: string,
  transaction: ITransactionDocument,
  oldTr?: ITransactionDocument,
  multiplier = 1,
) => {
  if (
    !oldTr?._id ||
    (transaction.branchId === oldTr?.branchId &&
      transaction.departmentId === oldTr?.departmentId)
  ) {
    const diffsByProductId = collectInventoryDiffs(
      transaction,
      multiplier,
      1,
    );

    if (oldTr?._id) {
      mergeInventoryDiffs(
        diffsByProductId,
        collectInventoryDiffs(oldTr, multiplier, -1),
      );
    }

    sendInventoryDiffs(
      subdomain,
      transaction.branchId,
      transaction.departmentId,
      diffsByProductId,
    );
    return;
  }

  sendInventoryDiffs(
    subdomain,
    oldTr?.branchId,
    oldTr?.departmentId,
    collectInventoryDiffs(oldTr, multiplier, -1),
  );

  sendInventoryDiffs(
    subdomain,
    transaction.branchId,
    transaction.departmentId,
    collectInventoryDiffs(transaction, multiplier, 1),
  );
};

/**
 * barimt ustgahad hamaarah baraanii uldegdel sync hiih
 * @param transaction: ustaj bui transaction obj
 * @param multiplier: ugiin urvuu ch gesen orlogo ustgah ni default 1
 */
export const removeSyncProductsInventory = async (
  subdomain: string,
  transaction: ITransactionDocument,
  multiplier = 1,
) => {
  sendInventoryDiffs(
    subdomain,
    transaction.branchId,
    transaction.departmentId,
    collectInventoryDiffs(transaction, multiplier, -1),
  );
};
