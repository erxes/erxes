import { IModels } from '~/connectionResolvers';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import { fixNum } from 'erxes-api-shared/utils';
import CurrencyTr from './currencyTr';
import TaxTrs from './taxTrs';
import { InvIncomeExpenseTrs } from './invIncome';
import InvSaleOutCostTrs from './invSale';
import { createOrUpdateTr, syncProductsInventory } from './utils';
import InvMoveInTrs from './invMove';
import InvSaleReturnOutCostTrs from './invSaleReturn';
import { TR_SIDES } from '../@types/constants';
import { commonRemove } from './commonRemove';
import { syncFxaIncomeDetails } from './fxaIncome';
import { createFxaDisposalFollowTrs, syncFxaDisposalInstances } from './fxaOut';
import {
  createFxaMoveDepreciationFollowTrs,
  createFxaMoveInFollowTr,
  syncFxaMoveInstances,
} from './fxaMove';
import {
  prepareFxaDisposalTransaction,
  prepareFxaOwnerRecordTransaction,
  rebuildFixedAssetCurrentCounts,
} from './fixedAssets';
import { activeCost } from './inventories';
import { saveInvJustify } from './invJustify';
import {
  FXA_OWNER_RECORD_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';

export const commonSave = async (
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) => {
  if (oldTr?.journal && oldTr.journal !== doc.journal) {
    throw new Error('Journal cannot be changed');
  }

  const handler = getJournalHandler(doc.journal);
  if (!handler) throw new Error(`Unsupported journal: ${doc.journal}`);

  const { mainTr, otherTrs } = await handler(
    subdomain,
    models,
    userId,
    doc,
    oldTr,
  );

  if (!mainTr) throw new Error('main transaction not found');

  const refreshedMainTr = await models.Transactions.getTransaction({
    _id: mainTr._id,
  });

  return { mainTr: refreshedMainTr, otherTrs };
};

function getJournalHandler(journal: string) {
  const handlers: Record<
    string,
    (
      subdomain: string,
      models: IModels,
      userId: string,
      doc: ITransaction,
      oldTr?: ITransactionDocument,
    ) => Promise<{
      mainTr: ITransactionDocument | null;
      otherTrs: ITransactionDocument[];
    }>
  > = {
    main: handleMain,
    exchangeDiff: handleMain,
    cash: handleSingleTr,
    bank: handleSingleTr,
    receivable: handleSingleTr,
    payable: handleSingleTr,
    invIncome: handleInvIncome,
    invOut: handleInvOut,
    invJustify: saveInvJustify,
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

const isNonEmptyString = (value?: string): value is string => !!value;

const applyActiveInventoryCosts = async (
  models: IModels,
  doc: ITransaction,
  excludedTransactionIds: string[] = [],
) => {
  const details = (doc.details || []).map((detail) => ({ ...detail }));
  const groups = new Map<
    string,
    {
      accountId: string;
      branchId?: string;
      departmentId?: string;
      detailIndexes: number[];
    }
  >();

  details.forEach((detail, detailIndex) => {
    const branchId = detail.branchId || doc.branchId;
    const departmentId = detail.departmentId || doc.departmentId;
    const key = JSON.stringify([detail.accountId, branchId, departmentId]);
    const group = groups.get(key) || {
      accountId: detail.accountId,
      branchId,
      departmentId,
      detailIndexes: [],
    };

    group.detailIndexes.push(detailIndex);
    groups.set(key, group);
  });

  await Promise.all(
    [...groups.values()].map(async (group) => {
      const productIds = group.detailIndexes
        .map((detailIndex) => details[detailIndex].productId)
        .filter(isNonEmptyString);
      const costs = await activeCost(
        models,
        group.accountId,
        group.branchId,
        group.departmentId,
        productIds,
        excludedTransactionIds,
      );

      for (const detailIndex of group.detailIndexes) {
        const detail = details[detailIndex];
        const unitPrice = costs[detail.productId || '']?.unitCost ?? 0;
        detail.unitPrice = unitPrice;
        detail.amount = fixNum(unitPrice * (detail.count ?? 0), 4);
      }
    }),
  );

  return { ...doc, details };
};

const getRemovedFxaDetailIds = (
  oldTr: ITransactionDocument,
  doc: ITransaction,
) => {
  const newDetailIds = new Set(
    (doc.details || []).map((detail) => detail._id).filter(isNonEmptyString),
  );

  return (oldTr.details || [])
    .filter(
      (detail) =>
        detail.fixedAssetId && detail._id && !newDetailIds.has(detail._id),
    )
    .map((detail) => detail._id)
    .filter(isNonEmptyString);
};

async function handleMain(
  _subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const taxTrsClass = new TaxTrs(
    models,
    userId,
    doc,
    doc.side === TR_SIDES.DEBIT ? 'ct' : 'dt',
    true,
  );
  await taxTrsClass.checkTaxValidation();
  const mainTr = await createOrUpdateTr(models, userId, doc, oldTr);
  return {
    mainTr,
    otherTrs: await collect(await taxTrsClass.doTaxTrs(mainTr)),
  };
}

async function handleSingleTr(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const currencyTrClass = new CurrencyTr(models, subdomain, userId, doc);
  const taxTrsClass = new TaxTrs(
    models,
    userId,
    doc,
    doc.side === 'dt' ? 'ct' : 'dt',
    true,
  );

  await currencyTrClass.checkValidationCurrency();
  await taxTrsClass.checkTaxValidation();

  const transaction = await createOrUpdateTr(
    models,
    userId,
    await currencyTrClass.cleanDoc(), // ...doc
    oldTr,
  );
  const otherTrs = [
    ...(await collect(await currencyTrClass.doCurrencyTr(transaction))),
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function handleInvIncome(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const taxTrsClass = new TaxTrs(models, userId, doc, 'dt', false);
  await taxTrsClass.checkTaxValidation();

  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...doc, side: TR_SIDES.DEBIT },
    oldTr,
  );

  await syncProductsInventory(subdomain, transaction, oldTr, 1);

  const otherTrs = [
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
    ...(await collect(await InvIncomeExpenseTrs(models, userId, transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function handleInvOut(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const costedDoc = await applyActiveInventoryCosts(
    models,
    doc,
    oldTr?._id ? [oldTr._id] : [],
  );
  const mainTr = await createOrUpdateTr(
    models,
    userId,
    { ...costedDoc, side: TR_SIDES.CREDIT },
    oldTr,
  );

  await syncProductsInventory(subdomain, mainTr, oldTr, -1);

  return { mainTr, otherTrs: [] };
}

async function handleInvMove(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const invMoveInTrsClass = new InvMoveInTrs(models, userId, doc);
  await invMoveInTrsClass.checkValidation();

  const oldFollowInTrs = oldTr?._id
    ? await invMoveInTrsClass.getOldFollowInTrs(oldTr._id)
    : [];
  const costedDoc = await applyActiveInventoryCosts(models, doc, [
    ...(oldTr?._id ? [oldTr._id] : []),
    ...oldFollowInTrs.map((transaction) => transaction._id),
  ]);

  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...costedDoc, side: TR_SIDES.CREDIT },
    oldTr,
  );
  const { invMoveInTr, oldFollowInTr } = await invMoveInTrsClass.doTrs(
    transaction,
    oldFollowInTrs,
  );

  await syncProductsInventory(subdomain, transaction, oldTr, -1);
  await syncProductsInventory(subdomain, invMoveInTr, oldFollowInTr, 1);

  return { mainTr: transaction, otherTrs: [invMoveInTr] };
}

async function handleInvSale(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const invSaleOtherTrsClass = new InvSaleOutCostTrs(
    subdomain,
    models,
    userId,
    doc,
  );
  const taxTrsClass = new TaxTrs(models, userId, doc, 'ct', false);

  await invSaleOtherTrsClass.checkValidation();
  await taxTrsClass.checkTaxValidation();

  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...doc, side: TR_SIDES.CREDIT },
    oldTr,
  );
  const otherTrs = [
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
    ...(await collect(await invSaleOtherTrsClass.doTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function handleInvSaleReturn(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const invSaleReturnOtherTrsClass = new InvSaleReturnOutCostTrs(
    subdomain,
    models,
    userId,
    doc,
  );
  const taxTrsClass = new TaxTrs(models, userId, doc, 'dt', false);

  await invSaleReturnOtherTrsClass.checkValidation();
  await taxTrsClass.checkTaxValidation();

  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...doc, side: TR_SIDES.DEBIT },
    oldTr,
  );
  const otherTrs = [
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
    ...(await collect(await invSaleReturnOtherTrsClass.doTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function handleFxaIncome(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const taxTrsClass = new TaxTrs(models, userId, doc, 'dt', false);
  await taxTrsClass.checkTaxValidation();

  if (oldTr) {
    const removedDetailIds = getRemovedFxaDetailIds(oldTr, doc);

    if (removedDetailIds.length) {
      await commonRemove(subdomain, models, oldTr, undefined, {
        detailIds: removedDetailIds,
        validateOnly: true,
      });
    }
  }

  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...doc, side: TR_SIDES.DEBIT },
    oldTr,
  );

  await syncFxaIncomeDetails(models, userId, transaction);

  const otherTrs = [
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function handleFxaOut(
  _subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const preparedDoc = await prepareFxaDisposalTransaction(models, doc);
  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...preparedDoc, side: TR_SIDES.CREDIT },
    oldTr,
  );

  await syncFxaDisposalInstances(
    models,
    userId,
    transaction,
    FXA_LOG_EVENT_TYPES.DISPOSAL,
    FXA_OWNER_RECORD_STATUSES.INACTIVE,
  );

  const otherTrs = await createFxaDisposalFollowTrs(
    models,
    userId,
    transaction,
  );

  return { mainTr: transaction, otherTrs };
}

async function handleFxaMove(
  _subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const preparedDoc = await prepareFxaOwnerRecordTransaction(models, doc);
  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...preparedDoc, side: TR_SIDES.CREDIT },
    oldTr,
  );

  await syncFxaMoveInstances(models, userId, transaction);
  const depreciationTrs = await createFxaMoveDepreciationFollowTrs(
    models,
    userId,
    transaction,
  );
  const moveInTr = await createFxaMoveInFollowTr(models, userId, transaction);
  await rebuildFixedAssetCurrentCounts(
    models,
    (transaction.details || [])
      .map((detail) => detail.fixedAssetId)
      .filter((fixedAssetId): fixedAssetId is string => Boolean(fixedAssetId)),
  );

  return { mainTr: transaction, otherTrs: [...depreciationTrs, moveInTr] };
}

async function handleFxaSale(
  _subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const taxTrsClass = new TaxTrs(models, userId, doc, 'ct', false);
  await taxTrsClass.checkTaxValidation();
  const preparedDoc = await prepareFxaDisposalTransaction(models, doc, {
    updateDetails: false,
  });

  const transaction = await createOrUpdateTr(
    models,
    userId,
    { ...preparedDoc, side: TR_SIDES.CREDIT },
    oldTr,
  );

  await syncFxaDisposalInstances(
    models,
    userId,
    transaction,
    FXA_LOG_EVENT_TYPES.SALE,
    FXA_OWNER_RECORD_STATUSES.INACTIVE,
  );

  const otherTrs = [
    ...(await createFxaDisposalFollowTrs(models, userId, transaction)),
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function collect<T>(result: T | T[] | null | undefined): Promise<T[]> {
  if (!result) return [];
  return Array.isArray(result) ? result : [result];
}
