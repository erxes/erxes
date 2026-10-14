/* eslint-disable @typescript-eslint/no-unused-vars */
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '../@types/transaction';
import { removeSyncProductsInventory } from './utils';
import { TR_FOLLOW_TYPES } from '../@types/constants';
import { removeFxaIncomeDetails } from './fxaIncome';
import { removeFxaDisposalInstances } from './fxaOut';
import { removeFxaMoveInstances } from './fxaMove';
import {
  getUniqueFxaOwnerRecordIds,
  rebuildFixedAssetCurrentCounts,
} from './fixedAssets';
import { removeInvJustify } from './invJustify';
import { isInvSplitFollow, removeInvSplitFollowTrs } from './invSplit';

export type TCommonRemoveOptions = {
  detailIds?: string[];
  validateOnly?: boolean;
};

type TJournalRemoveHandler = (
  models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  options?: TCommonRemoveOptions,
) => Promise<void>;

const removeFollowTransactions = async (
  models: IModels,
  transactionId: string,
  originTypes: string[],
) => {
  await models.Transactions.deleteMany({
    originId: transactionId,
    originType: { $in: originTypes },
  });
};

export const commonRemove = async (
  subdomain: string,
  models: IModels,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  options: TCommonRemoveOptions = {},
): Promise<void> => {
  if (options.validateOnly) {
    await commonRemoveValidation(
      subdomain,
      models,
      transaction,
      followTrs,
      options,
    );
    return;
  }
  const handler = getJournalHandler(transaction.journal);
  if (!handler) return;

  await handler(models, subdomain, transaction, followTrs, options);
};

export const commonRemoveValidation = async (
  subdomain: string,
  models: IModels,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  options: TCommonRemoveOptions = {},
): Promise<void> => {
  const validators: Record<string, TJournalRemoveHandler> = {
    fxaIncome: validateFxaIncomeRemove,
  };
  const validator = validators[transaction.journal];
  if (validator) {
    await validator(models, subdomain, transaction, followTrs, {
      ...options,
      validateOnly: true,
    });
  }
};

function getJournalHandler(journal: string) {
  const handlers: Record<string, TJournalRemoveHandler> = {
    main: handleNone,
    cash: handleNone,
    bank: handleNone,
    receivable: handleNone,
    payable: handleNone,
    invIncome: handleInvIncome,
    invOut: handleInvOut,
    invJustify: removeInvJustify,
    invMove: handleInvMove,
    invSale: handleInvSale,
    invSaleReturn: handleInvSaleReturn,
    fxaIncome: handleFxaIncome,
    fxaOut: handleFxaOut,
    fxaMove: handleFxaMove,
    fxaSale: handleFxaSale,
  };

  return handlers[journal];
}

async function handleNone(
  _models: IModels,
  _subdomain: string,
  _transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  return;
}

async function handleInvIncome(
  models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  if (isInvSplitFollow(transaction)) {
    return;
  }
  await removeSyncProductsInventory(subdomain, transaction, 1);
  await removeInvSplitFollowTrs(subdomain, models, transaction._id);
}

async function handleInvOut(
  _models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  if (isInvSplitFollow(transaction)) {
    return;
  }
  await removeSyncProductsInventory(subdomain, transaction, -1);
}

async function handleInvMove(
  models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeSyncProductsInventory(subdomain, transaction, -1);
  await removeInvSplitFollowTrs(subdomain, models, transaction._id);
  const moveInTr = followTrs?.find(
    (ftr) =>
      ftr.originId === transaction._id &&
      ftr.originType === TR_FOLLOW_TYPES.INV_MOVE_IN,
  );
  if (moveInTr) {
    await removeSyncProductsInventory(subdomain, moveInTr, 1);
  }
}

async function handleInvSale(
  _models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  const saleOutTr = followTrs?.find(
    (ftr) =>
      ftr.originId === transaction._id &&
      ftr.originType === TR_FOLLOW_TYPES.INV_SALE_OUT,
  );
  if (saleOutTr) {
    await removeSyncProductsInventory(subdomain, saleOutTr, -1);
  }
}

async function handleInvSaleReturn(
  _models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  const saleOutTr = followTrs?.find(
    (ftr) =>
      ftr.originId === transaction._id &&
      ftr.originType === TR_FOLLOW_TYPES.INV_SALE_RETURN_OUT,
  );
  if (saleOutTr) {
    await removeSyncProductsInventory(subdomain, saleOutTr, 1);
  }
}

async function validateFxaIncomeRemove(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  options?: TCommonRemoveOptions,
): Promise<void> {
  await removeFxaIncomeDetails(models, transaction, {
    ...options,
    validateOnly: true,
  });
}

async function handleFxaIncome(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  options?: TCommonRemoveOptions,
) {
  await removeFxaIncomeDetails(models, transaction, options);
  if (options?.validateOnly) return;
  await removeFollowTransactions(models, transaction._id, [
    TR_FOLLOW_TYPES.FXA_DEP_IN,
  ]);
}

async function handleFxaOut(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeFxaDisposalInstances(models, transaction);
  await removeFollowTransactions(models, transaction._id, [
    TR_FOLLOW_TYPES.FXA_DEP_OUT,
  ]);
  await rebuildFixedAssetCurrentCounts(
    models,
    getUniqueFxaOwnerRecordIds(
      (transaction.details || [])
        .map((detail) => detail.fixedAssetId)
        .filter((fixedAssetId): fixedAssetId is string =>
          Boolean(fixedAssetId),
        ),
    ),
  );
}

async function handleFxaMove(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeFxaMoveInstances(models, transaction);
  await removeFollowTransactions(models, transaction._id, [
    TR_FOLLOW_TYPES.FXA_MOVE_IN,
    TR_FOLLOW_TYPES.FXA_DEP_OUT,
    TR_FOLLOW_TYPES.FXA_DEP_IN,
  ]);
  await rebuildFixedAssetCurrentCounts(
    models,
    getUniqueFxaOwnerRecordIds(
      (transaction.details || [])
        .map((detail) => detail.fixedAssetId)
        .filter((fixedAssetId): fixedAssetId is string =>
          Boolean(fixedAssetId),
        ),
    ),
  );
}

async function handleFxaSale(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeFxaDisposalInstances(models, transaction);
  await removeFollowTransactions(models, transaction._id, [
    TR_FOLLOW_TYPES.FXA_SALE_OUT,
    TR_FOLLOW_TYPES.FXA_DEP_OUT,
    TR_FOLLOW_TYPES.FXA_SALE_COST,
  ]);
  await rebuildFixedAssetCurrentCounts(
    models,
    getUniqueFxaOwnerRecordIds(
      (transaction.details || [])
        .map((detail) => detail.fixedAssetId)
        .filter((fixedAssetId): fixedAssetId is string =>
          Boolean(fixedAssetId),
        ),
    ),
  );
}
