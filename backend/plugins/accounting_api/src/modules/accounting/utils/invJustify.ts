import { IModels } from '~/connectionResolvers';
import { TR_SIDES } from '../@types/constants';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import {
  createOrUpdateTr,
  removeSyncProductsInventory,
  syncProductsInventory,
} from './utils';

const getAdjustmentMultiplier = (side?: string) => {
  if (![TR_SIDES.DEBIT, TR_SIDES.CREDIT].includes(side || '')) {
    throw new Error('Inventory cost adjustment side must be dt or ct');
  }

  return side === TR_SIDES.DEBIT ? 1 : -1;
};

export const saveInvJustify = async (
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) => {
  getAdjustmentMultiplier(doc.side);

  const normalizedDoc = {
    ...doc,
    details: (doc.details || []).map((detail) => ({
      ...detail,
      count: 0,
    })),
  };
  const mainTr = await createOrUpdateTr(models, userId, normalizedDoc, oldTr);
  const multiplier = getAdjustmentMultiplier(mainTr.side);

  if (oldTr && oldTr.side !== mainTr.side) {
    await removeSyncProductsInventory(
      subdomain,
      oldTr,
      getAdjustmentMultiplier(oldTr.side),
    );
    await syncProductsInventory(subdomain, mainTr, undefined, multiplier);
  } else {
    await syncProductsInventory(subdomain, mainTr, oldTr, multiplier);
  }

  return { mainTr, otherTrs: [] };
};

export const removeInvJustify = async (
  _models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
) => {
  await removeSyncProductsInventory(
    subdomain,
    transaction,
    getAdjustmentMultiplier(transaction.side),
  );
};
