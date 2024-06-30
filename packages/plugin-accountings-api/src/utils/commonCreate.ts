import { IModels } from "../connectionResolver";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import { checkValidationCurrency, doCurrencyTr } from "./currencyTr";

export const commonCreate = async (models: IModels, doc: ITransaction) => {
  switch (doc.journal) {
    case 'main': {
      return { mainTr: await models.Transactions.createTransaction({ ...doc }) };
    }
    case 'cash': {
      const currencyDiffTrDoc = await checkValidationCurrency(models, doc);

      const transaction =
        await models.Transactions.createTransaction({ ...doc });

      const currencyTr = await doCurrencyTr(models, transaction, currencyDiffTrDoc);
      if (currencyTr) {
        return { mainTr: transaction, otherTrs: [currencyTr] }
      }
      return { mainTr: transaction };
    }
  }
  return { mainTr: {} as ITransactionDocument }
}
