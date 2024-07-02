import { IModels } from "../connectionResolver";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import CurrencyTr  from "./currencyTr";

export const commonCreate = async (models: IModels, doc: ITransaction) => {
  switch (doc.journal) {
    case 'main': {
      return { mainTr: await models.Transactions.createTransaction({ ...doc }) };
    }
    case 'cash': {
      const currencyTrClass = new CurrencyTr(models, doc);
      await currencyTrClass.checkValidationCurrency();

      const transaction =
        await models.Transactions.createTransaction({ ...doc });

      const currencyTr = await currencyTrClass.doCurrencyTr(transaction);
      if (currencyTr) {
        return { mainTr: transaction, otherTrs: [currencyTr] }
      }
      return { mainTr: transaction };
    }
  }
  return { mainTr: {} as ITransactionDocument }
}
