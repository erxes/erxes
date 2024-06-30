import { IModels } from "../connectionResolver";
import { ITransaction, ITransactionDocument } from "../models/definitions/transaction";
import { checkValidationCurrency, doCurrencyTr } from "./currencyTr";

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
      const currencyDiffTrDoc = await checkValidationCurrency(models, doc);

      const transaction =
        await models.Transactions.updateTransaction(oldTr._id, { ...doc });
      currencyTr = await doCurrencyTr(models, transaction, currencyDiffTrDoc)

      if (currencyTr) {
        return { mainTr: transaction, otherTrs: [currencyTr] }
      }
      return { mainTr: transaction };
    }
  }
  return { mainTr: {} as ITransactionDocument }
}
