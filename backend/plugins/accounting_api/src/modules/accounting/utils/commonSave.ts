import { IModels } from '~/connectionResolvers';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import CurrencyTr from './currencyTr';
import TaxTrs from './taxTrs';
import { InvIncomeExpenseTrs } from './invIncome';
import InvSaleOutCostTrs from './invSale';
import { createOrUpdateTr, syncProductsInventory } from './utils';
import InvMoveInTrs from './invMove';
import InvSaleReturnOutCostTrs from './invSaleReturn';

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
    cash: handleSingleTr,
    bank: handleSingleTr,
    receivable: handleSingleTr,
    payable: handleSingleTr,
    invIncome: handleInvIncome,
    invOut: handleInvOut,
    invMove: handleInvMove,
    invSale: handleInvSale,
    invSaleReturn: handleInvSaleReturn,
  };

  return handlers[journal];
}

async function handleMain(
  _subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const mainTr = await createOrUpdateTr(models, userId, doc, oldTr);
  return { mainTr, otherTrs: [] };
}

async function handleSingleTr(
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) {
  const detail = doc.details[0] || {};
  const currencyTrClass = new CurrencyTr(models, subdomain, userId, doc);
  const taxTrsClass = new TaxTrs(
    models,
    userId,
    doc,
    detail.side === 'dt' ? 'ct' : 'dt',
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

  const transaction = await createOrUpdateTr(models, userId, doc, oldTr);

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
  const mainTr = await createOrUpdateTr(models, userId, doc, oldTr);

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

  const transaction = await createOrUpdateTr(models, userId, doc, oldTr);
  const { invMoveInTr, oldFollowInTr } =
    await invMoveInTrsClass.doTrs(transaction);

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

  const transaction = await createOrUpdateTr(models, userId, doc, oldTr);
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

  const transaction = await createOrUpdateTr(models, userId, doc, oldTr);
  const otherTrs = [
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
    ...(await collect(await invSaleReturnOtherTrsClass.doTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function collect<T>(result: T | T[] | null | undefined): Promise<T[]> {
  if (!result) return [];
  return Array.isArray(result) ? result : [result];
}
