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
    diffSoonOut: fixNum(
      (current.diffSoonOut ?? 0) + (diff.diffSoonOut ?? 0),
      6,
    ),
  };
};

type TInventoryLocationDiff = {
  branchId: string;
  departmentId: string;
  products: Record<string, TInventoryDiff>;
};

const collectInventoryDiffs = (
  transaction: ITransaction,
  multiplier: number,
  direction: 1 | -1,
  locations = new Map<string, TInventoryLocationDiff>(),
): Map<string, TInventoryLocationDiff> => {
  const statusType = getInventoryStatusType(transaction.status);
  const isIncome = multiplier > 0;

  if (statusType === TR_INVENTORY_STATUS_TYPES.OMIT) return locations;

  for (const detail of transaction.details || []) {
    if (!detail.productId) continue;
    const branchId = detail.branchId || transaction.branchId || '_';
    const departmentId = detail.departmentId || transaction.departmentId || '_';
    const key = JSON.stringify([branchId, departmentId]);
    const location = locations.get(key) ?? {
      branchId,
      departmentId,
      products: {},
    };
    locations.set(key, location);
    const count = detail.count || 0;
    const amount = detail.amount || 0;

    addInventoryDiff(
      location.products,
      detail.productId,
      statusType === TR_INVENTORY_STATUS_TYPES.REAL
        ? {
            diffCount: direction * multiplier * count,
            diffCost: direction * multiplier * amount,
          }
        : {
            diffSoonIn: isIncome ? direction * count : 0,
            diffSoonOut: isIncome ? 0 : direction * count,
          },
    );
  }

  return locations;
};

const hasInventoryDiff = (diff: TInventoryDiff) =>
  diff.diffCount || diff.diffCost || diff.diffSoonIn || diff.diffSoonOut;

const sendInventoryDiffs = (
  subdomain: string,
  locations: Map<string, TInventoryLocationDiff>,
): void => {
  for (const { branchId, departmentId, products } of locations.values()) {
    const productsInfo = Object.entries(products)
      .filter(([, diff]) => hasInventoryDiff(diff))
      .map(([productId, diff]) => ({ productId, ...diff }));
    if (!productsInfo.length) continue;

    void sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseInventories',
      input: { branchId, departmentId, productsInfo },
    });
  }
};

export const syncProductsInventory = async (
  subdomain: string,
  transaction: ITransaction,
  oldTr?: ITransaction,
  multiplier = 1,
): Promise<void> => {
  const locations = collectInventoryDiffs(transaction, multiplier, 1);
  if (oldTr?._id) collectInventoryDiffs(oldTr, multiplier, -1, locations);
  sendInventoryDiffs(subdomain, locations);
};

export const removeSyncProductsInventory = async (
  subdomain: string,
  transaction: ITransaction,
  multiplier = 1,
): Promise<void> => {
  sendInventoryDiffs(
    subdomain,
    collectInventoryDiffs(transaction, multiplier, -1),
  );
};
