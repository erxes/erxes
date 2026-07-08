/* eslint-disable @typescript-eslint/no-unused-vars */
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '../@types/transaction';
import { removeSyncProductsInventory } from './utils';
import { TR_FOLLOW_TYPES } from '../@types/constants';
import {
  removeFxaDisposalInstances,
  removeFxaIncomeInstances,
  removeFxaMoveInstances,
  TFxaIncomeInstanceRemoveOptions,
} from './fixedAssets';

export type TCommonRemoveOptions = TFxaIncomeInstanceRemoveOptions;

export const commonRemove = async (
  subdomain: string,
  models: IModels,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  options: TCommonRemoveOptions = {},
) => {
  const handler = getJournalHandler(transaction.journal);
  if (!handler) return;

  await handler(models, subdomain, transaction, followTrs, options);
};

function getJournalHandler(journal: string) {
  const handlers: Record<
    string,
    (
      models: IModels,
      subdomain: string,
      transaction: ITransactionDocument,
      followTrs?: ITransactionDocument[],
      options?: TCommonRemoveOptions,
    ) => Promise<void>
  > = {
    main: handleNone,
    cash: handleNone,
    bank: handleNone,
    receivable: handleNone,
    payable: handleNone,
    invIncome: handleInvIncome,
    invOut: handleInvOut,
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
  _models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeSyncProductsInventory(subdomain, transaction, 1);
}

async function handleInvOut(
  _models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeSyncProductsInventory(subdomain, transaction, -1);
}

async function handleInvMove(
  _models: IModels,
  subdomain: string,
  transaction: ITransactionDocument,
  followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeSyncProductsInventory(subdomain, transaction, -1);
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

async function handleFxaIncome(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  options?: TCommonRemoveOptions,
) {
  await removeFxaIncomeInstances(models, transaction, options);
}

async function handleFxaOut(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeFxaDisposalInstances(models, transaction);
}

async function handleFxaMove(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeFxaMoveInstances(models, transaction);
}

async function handleFxaSale(
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
  _followTrs?: ITransactionDocument[],
  _options?: TCommonRemoveOptions,
) {
  await removeFxaDisposalInstances(models, transaction);
}
