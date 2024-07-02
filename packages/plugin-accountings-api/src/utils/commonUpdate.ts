import { IModels } from "../connectionResolver";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import CurrencyTr from "./currencyTr";

export const commonUpdate = async (models: IModels, doc: ITransaction, oldTr?: ITransactionDocument) => {
  if (!oldTr || oldTr.journal !== doc.journal) {
    throw new Error('Not change journal')
  }

  switch (doc.journal) {
    case 'main': {
      return { mainTr: await models.Transactions.updateTransaction(oldTr._id, { ...doc }) };
    }
    case 'cash': {
      let currencyTr;
      const currencyTrClass = new CurrencyTr(models, doc);
      await currencyTrClass.checkValidationCurrency();

      const transaction =
        await models.Transactions.updateTransaction(oldTr._id, { ...doc });
      currencyTr = await currencyTrClass.doCurrencyTr(transaction)

      if (currencyTr) {
        return { mainTr: transaction, otherTrs: [currencyTr] }
      }
      return { mainTr: transaction };
    }
  }
  return { mainTr: {} as ITransactionDocument }
}
