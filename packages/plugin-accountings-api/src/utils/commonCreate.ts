import { IModels } from "../connectionResolver";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import CurrencyTr from "./currencyTr";

export const commonCreate = async (models: IModels, doc: ITransaction) => {
  let mainTr: ITransactionDocument | null = null;
  let otherTrs: ITransactionDocument[] = [];
  switch (doc.journal) {
    case 'main': {
      mainTr = await models.Transactions.createTransaction({ ...doc });
      break;
    }
    case 'cash': {
      const currencyTrClass = new CurrencyTr(models, doc);
      await currencyTrClass.checkValidationCurrency();

      const transaction =
        await models.Transactions.createTransaction({ ...doc });

      mainTr = transaction;

      const currencyTr = await currencyTrClass.doCurrencyTr(transaction);
      if (currencyTr) {
        otherTrs.push(currencyTr)
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
