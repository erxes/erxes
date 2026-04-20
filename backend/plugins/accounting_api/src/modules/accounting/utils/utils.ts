import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  ACCOUNT_KINDS,
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
  const countByProductId: { [productId: string]: number } = {};

  // 1 transaction ni adilhan product buhii detailtai baij boloh
  transaction?.details.forEach((det) => {
    countByProductId[det.productId ?? ''] = fixNum(
      (countByProductId[det.productId ?? ''] ?? 0) + (det.count ?? 0),
      4,
    );
  });

  if (
    !oldTr?._id ||
    (transaction.branchId === oldTr?.branchId &&
      transaction.departmentId === oldTr?.departmentId)
  ) {
    // huuchin baival shineer tsootsoolsnoo buuruulj baina
    oldTr?.details.forEach((det) => {
      countByProductId[det.productId ?? ''] = fixNum(
        (countByProductId[det.productId ?? ''] ?? 0) - (det.count ?? 0),
        4,
      );
    });

    sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseInventories',
      input: {
        branchId: transaction.branchId,
        departmentId: transaction.departmentId,
        productsInfo: Object.keys(countByProductId)
          .filter((productId) => countByProductId[productId])
          .map((productId) => ({
            productId,
            diffCount: multiplier * countByProductId[productId],
          })),
      },
    });
    return;
  }

  // huuchin detailseer uldegdel hasna
  const countByProductIdOld: { [productId: string]: number } = {};

  // 1 transaction ni adilhan product buhii detailtai baij boloh
  oldTr?.details.forEach((det) => {
    countByProductIdOld[det.productId ?? ''] = fixNum(
      (countByProductIdOld[det.productId ?? ''] ?? 0) + (det.count ?? 0),
      4,
    );
  });

  sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'core',
    module: 'products',
    action: 'increaseInventories',
    input: {
      branchId: oldTr?.branchId,
      departmentId: oldTr?.departmentId,
      productsInfo: Object.keys(countByProductIdOld)
        .filter((productId) => countByProductIdOld[productId])
        .map((productId) => ({
          productId,
          diffCount: -1 * multiplier * countByProductIdOld[productId],
        })),
    },
  });

  // ehend tootsolsonoor shine detailseer uldegdel nemne
  sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'core',
    module: 'products',
    action: 'increaseInventories',
    input: {
      branchId: transaction.branchId,
      departmentId: transaction.departmentId,
      productsInfo: Object.keys(countByProductId)
        .filter((productId) => countByProductId[productId])
        .map((productId) => ({
          productId,
          diffCount: multiplier * countByProductId[productId],
        })),
    },
  });
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
  sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'core',
    module: 'products',
    action: 'increaseInventories',
    input: {
      branchId: transaction.branchId,
      departmentId: transaction.departmentId,
      productsInfo: transaction.details?.map((det) => ({
        productId: det.productId,
        diffCount: -1 * multiplier * (det.count ?? 0),
      })),
    },
  });
};
