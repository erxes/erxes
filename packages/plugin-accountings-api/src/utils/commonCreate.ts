import { IModels } from "../connectionResolver";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import CurrencyTr from "./currencyTr";
import TaxTrs from './taxTrs';

export const commonCreate = async (subdomain: string, models: IModels, doc: ITransaction) => {
  let mainTr: ITransactionDocument | null = null;
  let otherTrs: ITransactionDocument[] = [];
  switch (doc.journal) {
    case 'main': {
      mainTr = await models.Transactions.createTransaction({ ...doc });
      break;
    }
    case 'cash':
    case 'bank':
    case 'receivable':
    case 'payable': {
      const detail = doc.details[0] || {}
      const currencyTrClass = new CurrencyTr(subdomain, models, doc);
      await currencyTrClass.checkValidationCurrency();

      const taxTrsClass = new TaxTrs(models, doc, detail?.side === 'dt' ? 'ct' : 'dt', true);
      taxTrsClass.checkTaxValidation();

      const transaction =
        await models.Transactions.createTransaction({ ...doc });

      mainTr = transaction;

      const currencyTr = await currencyTrClass.doCurrencyTr(transaction);
      if (currencyTr) {
        otherTrs.push(currencyTr)
      }

      const taxTrs = await taxTrsClass.doTaxTrs(transaction)

      if (taxTrs?.length) {
        for (const taxTr of taxTrs) {
          otherTrs.push(taxTr)
        }
      }
      break;
    }
    case 'invIncome': {
      const taxTrsClass = new TaxTrs(models, doc, 'dt', false);
      taxTrsClass.checkTaxValidation();

      const transaction =
        await models.Transactions.createTransaction({ ...doc });

      mainTr = transaction;

      const taxTrs = await taxTrsClass.doTaxTrs(transaction)

      if (taxTrs?.length) {
        for (const taxTr of taxTrs) {
          otherTrs.push(taxTr)
        }
      }
      break;
    }

  }

  if (!mainTr) {
    throw new Error('main transaction not found')
  }
  mainTr = await models.Transactions.getTransaction({ _id: mainTr._id })

  return { mainTr, otherTrs };
}
