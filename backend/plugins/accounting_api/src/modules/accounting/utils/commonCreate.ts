import { IModels } from "~/connectionResolvers";
import CurrencyTr from "./currencyTr";
import TaxTrs from './taxTrs';
import { ITransaction, ITransactionDocument } from "../@types/transaction";
import { InvIncomeExpenseTrs } from '~/modules/accounting/utils/invIncome';

export const commonCreate = async (_subdomain: string, models: IModels, doc: ITransaction) => {
  let mainTr: ITransactionDocument | null = null;
  const otherTrs: ITransactionDocument[] = [];
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
      const currencyTrClass = new CurrencyTr(models, doc);
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

      const expenseTrs = await InvIncomeExpenseTrs(models, transaction)
      if (expenseTrs?.length) {
        for (const expenseTr of expenseTrs) {
          otherTrs.push(expenseTr)
        }
      }
      break;
    }
    case 'invOut': {
      const transaction =
        await models.Transactions.createTransaction({ ...doc });

      mainTr = transaction;
      break;
    }
    case 'invMove': {
      const transaction =
        await models.Transactions.createTransaction({ ...doc });

      mainTr = transaction;
      break;
    }
    case 'invSale': {
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
