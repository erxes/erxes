import { IModels } from "~/connectionResolvers";
import { ITransaction, ITransactionDocument } from "../@types/transaction";
import CurrencyTr from "./currencyTr";
import TaxTrs from "./taxTrs";
import { InvIncomeExpenseTrs } from './invIncome';
import InvSaleOutCostTrs from "./invSale";
import { createOrUpdateTr } from "./utils";
import InvMoveInTrs from "./invMove";

export const commonSave = async (subdomain: string, models: IModels, doc: ITransaction, oldTr?: ITransactionDocument) => {
  let mainTr: ITransactionDocument | null = null;
  const otherTrs: ITransactionDocument[] = [];

  if (oldTr?.journal && oldTr.journal !== doc.journal) {
    throw new Error('Not change journal')
  }


  switch (doc.journal) {
    case 'main': {
      mainTr = await createOrUpdateTr(models, doc, oldTr);
      break;
    }
    case 'cash':
    case 'bank':
    case 'receivable':
    case 'payable': {
      const detail = doc.details[0] || {}
      const currencyTrClass = new CurrencyTr(models, subdomain, doc);
      await currencyTrClass.checkValidationCurrency();

      const taxTrsClass = new TaxTrs(models, doc, detail?.side === 'dt' ? 'ct' : 'dt', true);
      await taxTrsClass.checkTaxValidation();

      const transaction = await await createOrUpdateTr(models, doc, oldTr);

      mainTr = transaction
      const currencyTr = await currencyTrClass.doCurrencyTr(transaction)

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
      await taxTrsClass.checkTaxValidation();

      const transaction = await createOrUpdateTr(models, doc, oldTr);

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
      const transaction = await createOrUpdateTr(models, doc, oldTr);

      mainTr = transaction;

      break;
    }
    case 'invMove': {
      const invMoveInTrsClass = new InvMoveInTrs(models, doc);
      await invMoveInTrsClass.checkValidation();

      const transaction = await createOrUpdateTr(models, doc, oldTr);

      mainTr = transaction;
      const moveInTrs = await invMoveInTrsClass.doTrs(transaction);
      if (moveInTrs?.length) {
        for (const tr of moveInTrs) {
          otherTrs.push(tr)
        }
      }

      break;
    }
    case 'invSale': {
      const invSaleOtherTrsClass = new InvSaleOutCostTrs(models, doc);
      const taxTrsClass = new TaxTrs(models, doc, 'dt', false);

      await invSaleOtherTrsClass.checkValidation();
      await taxTrsClass.checkTaxValidation();

      const transaction = await createOrUpdateTr(models, doc, oldTr);

      mainTr = transaction;

      const taxTrs = await taxTrsClass.doTaxTrs(transaction)

      if (taxTrs?.length) {
        for (const taxTr of taxTrs) {
          otherTrs.push(taxTr)
        }
      }

      const outCostTrs = await invSaleOtherTrsClass.doTrs(transaction);

      if (outCostTrs?.length) {
        for (const tr of outCostTrs) {
          otherTrs.push(tr)
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
