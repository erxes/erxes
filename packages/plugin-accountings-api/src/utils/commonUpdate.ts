import { IModels } from "../connectionResolver";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import CurrencyTr from "./currencyTr";

export const commonUpdate = async (models: IModels, doc: ITransaction, oldTr?: ITransactionDocument) => {
  let mainTr: ITransactionDocument | null = null;
  let otherTrs: ITransactionDocument[] = [];

  if (!oldTr || oldTr.journal !== doc.journal) {
    throw new Error('Not change journal')
  }


  switch (doc.journal) {
    case 'main': {
      mainTr = await models.Transactions.updateTransaction(oldTr._id, { ...doc });
      break;
    }
    case 'cash': {
      let currencyTr;
      const currencyTrClass = new CurrencyTr(models, doc);
      await currencyTrClass.checkValidationCurrency();

      const transaction =
        await models.Transactions.updateTransaction(oldTr._id, { ...doc });

      mainTr = transaction
      currencyTr = await currencyTrClass.doCurrencyTr(transaction)

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
