import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  ACCOUNT_KINDS,
} from '@/accounting/@types/constants';
import { IModels } from '~/connectionResolvers';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const createOrUpdateTr = async (
  models: IModels,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
): Promise<ITransactionDocument> => {
  if (oldTr?._id) {
    return await models.Transactions.updateTransaction(oldTr._id, { ...doc });
  }

  return await models.Transactions.createTransaction({ ...doc });
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

export const syncInProductsInventory = async (
  subdomain: string,
  transaction: ITransactionDocument,
  oldTr?: ITransactionDocument,
) => {
  const countByProductId: { [productId: string]: number } = {};
  transaction?.details.forEach((det) => {
    countByProductId[det.productId ?? ''] = det.count ?? 0;
  });

  if (
    !oldTr?._id ||
    (transaction.branchId === oldTr?.branchId &&
      transaction.departmentId === oldTr?.departmentId)
  ) {
    oldTr?.details.forEach((det) => {
      countByProductId[det.productId ?? ''] =
        (countByProductId[det.productId ?? ''] ?? 0) - 1 * (det.count ?? 0);
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
        productsInfo: Object.keys(countByProductId).map((productId) => ({
          productId,
          diffCount: countByProductId[productId],
        })),
      },
    });
  } else {
    sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseInventories',
      input: {
        branchId: oldTr?.branchId,
        departmentId: oldTr?.departmentId,
        productsInfo: oldTr?.details?.map((det) => ({
          productId: det.productId,
          diffCount: -1 * (det.count ?? 0),
        })),
      },
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
        productsInfo: Object.keys(countByProductId).map((productId) => ({
          productId,
          diffCount: countByProductId[productId],
        })),
      },
    });
  }
};

export const syncOutProductsInventory = async (
  subdomain: string,
  transaction: ITransactionDocument,
  oldTr: ITransactionDocument
) => {
  const countByProductId: { [productId: string]: number } = {};
  transaction?.details.forEach((det) => {
    countByProductId[det.productId ?? ''] = det.count ?? 0;
  });

  if (
    !oldTr?._id ||
    (transaction.branchId === oldTr?.branchId &&
      transaction.departmentId === oldTr?.departmentId)
  ) {
    oldTr?.details.forEach((det) => {
      countByProductId[det.productId ?? ''] =
        (countByProductId[det.productId ?? ''] ?? 0) - 1 * (det.count ?? 0);
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
        productsInfo: Object.keys(countByProductId).map((productId) => ({
          productId,
          diffCount: countByProductId[productId],
        })),
      },
    });
  } else {
    sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseInventories',
      input: {
        branchId: oldTr?.branchId,
        departmentId: oldTr?.departmentId,
        productsInfo: oldTr?.details?.map((det) => ({
          productId: det.productId,
          diffCount: -1 * (det.count ?? 0),
        })),
      },
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
        productsInfo: Object.keys(countByProductId).map((productId) => ({
          productId,
          diffCount: countByProductId[productId],
        })),
      },
    });
  }
};
