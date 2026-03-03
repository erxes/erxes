import { IModels } from "~/connectionResolvers";
import { ITransaction, ITransactionDocument } from "../@types/transaction";
import CurrencyTr from "./currencyTr";
import TaxTrs from "./taxTrs";
import { InvIncomeExpenseTrs } from "./invIncome";
import InvSaleOutCostTrs from "./invSale";
import { createOrUpdateTr } from "./utils";
import InvMoveInTrs from "./invMove";
import { sendTRPCMessage } from "erxes-api-shared/utils";

export const commonSave = async (
  subdomain: string,
  models: IModels,
  doc: ITransaction,
  oldTr?: ITransactionDocument
) => {
  if (oldTr?.journal && oldTr.journal !== doc.journal) {
    throw new Error("Journal cannot be changed");
  }

  const handler = getJournalHandler(doc.journal);
  if (!handler) throw new Error(`Unsupported journal: ${doc.journal}`);

  const { mainTr, otherTrs } = await handler(models, subdomain, doc, oldTr);

  if (!mainTr) throw new Error("main transaction not found");

  const refreshedMainTr = await models.Transactions.getTransaction({
    _id: mainTr._id,
  });

  return { mainTr: refreshedMainTr, otherTrs };
};

function getJournalHandler(journal: string) {
  const handlers: Record<
    string,
    (
      models: IModels,
      subdomain: string,
      doc: ITransaction,
      oldTr?: ITransactionDocument
    ) => Promise<{ mainTr: ITransactionDocument | null; otherTrs: ITransactionDocument[] }>
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
  };

  return handlers[journal];
}

async function handleMain(models: IModels, _subdomain: string, doc: ITransaction, oldTr?: ITransactionDocument) {
  const mainTr = await createOrUpdateTr(models, doc, oldTr);
  return { mainTr, otherTrs: [] };
}

async function handleSingleTr(models: IModels, subdomain: string, doc: ITransaction, oldTr?: ITransactionDocument) {
  const detail = doc.details[0] || {};
  const currencyTrClass = new CurrencyTr(models, subdomain, doc);
  const taxTrsClass = new TaxTrs(models, doc, detail.side === "dt" ? "ct" : "dt", true);

  await currencyTrClass.checkValidationCurrency();
  await taxTrsClass.checkTaxValidation();

  const transaction = await createOrUpdateTr(
    models,
    await currencyTrClass.cleanDoc(), // ...doc
    oldTr
  );
  const otherTrs = [
    ...(await collect(await currencyTrClass.doCurrencyTr(transaction))),
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function handleInvIncome(models: IModels, subdomain: string, doc: ITransaction, oldTr?: ITransactionDocument) {
  const taxTrsClass = new TaxTrs(models, doc, "dt", false);
  await taxTrsClass.checkTaxValidation();

  const transaction = await createOrUpdateTr(models, doc, oldTr);

  const countByProductId: { [productId: string]: number } = {}
  transaction?.details.forEach((det) => {
    countByProductId[det.productId ?? ''] = (det.count ?? 0);
  });

  if (!oldTr?._id || (transaction.branchId === oldTr?.branchId && transaction.departmentId === oldTr?.departmentId)) {
    oldTr?.details.forEach((det) => {
      countByProductId[det.productId ?? ''] = (countByProductId[det.productId ?? ''] ?? 0) - 1 * (det.count ?? 0);
    });

    sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseRemainders',
      input: {
        branchId: transaction.branchId,
        departmentId: transaction.departmentId,
        productsInfo: Object.keys(countByProductId).map(productId => ({
          productId, diffCount: countByProductId[productId]
        }))
      }
    });
  } else {
    sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseRemainders',
      input: {
        branchId: oldTr?.branchId,
        departmentId: oldTr?.departmentId,
        productsInfo: oldTr?.details?.map(det => ({ productId: det.productId, diffCount: -1 * (det.count ?? 0) }))
      }
    });

    sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'products',
      action: 'increaseRemainders',
      input: {
        branchId: transaction.branchId,
        departmentId: transaction.departmentId,
        productsInfo: Object.keys(countByProductId).map(productId => ({
          productId, diffCount: countByProductId[productId]
        }))
      }
    });
  }

  const otherTrs = [
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
    ...(await collect(await InvIncomeExpenseTrs(models, transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function handleInvOut(models: IModels, _subdomain: string, doc: ITransaction, oldTr?: ITransactionDocument) {
  const mainTr = await createOrUpdateTr(models, doc, oldTr);
  return { mainTr, otherTrs: [] };
}

async function handleInvMove(models: IModels, _subdomain: string, doc: ITransaction, oldTr?: ITransactionDocument) {
  const invMoveInTrsClass = new InvMoveInTrs(models, doc);
  await invMoveInTrsClass.checkValidation();

  const transaction = await createOrUpdateTr(models, doc, oldTr);
  const otherTrs = await collect(await invMoveInTrsClass.doTrs(transaction));

  return { mainTr: transaction, otherTrs };
}

async function handleInvSale(models: IModels, _subdomain: string, doc: ITransaction, oldTr?: ITransactionDocument) {
  const invSaleOtherTrsClass = new InvSaleOutCostTrs(models, doc);
  const taxTrsClass = new TaxTrs(models, doc, "dt", false);

  await invSaleOtherTrsClass.checkValidation();
  await taxTrsClass.checkTaxValidation();

  const transaction = await createOrUpdateTr(models, doc, oldTr);
  const otherTrs = [
    ...(await collect(await taxTrsClass.doTaxTrs(transaction))),
    ...(await collect(await invSaleOtherTrsClass.doTrs(transaction))),
  ];

  return { mainTr: transaction, otherTrs };
}

async function collect<T>(result: T | T[] | null | undefined): Promise<T[]> {
  if (!result) return [];
  return Array.isArray(result) ? result : [result];
}
