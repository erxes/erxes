import { IContext } from '../../connectionResolver';
import { ITransactionDocument } from '../../models/definitions/transaction';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Transactions.findOne({ _id });
  },

  async followTrs(transaction: ITransactionDocument, _, { dataLoaders }: IContext) {
    if (!transaction.follows?.length)
      return;

    return transaction.follows.map(f => dataLoaders.transaction.load(f.id))
  },

  async vatRow(transaction: ITransactionDocument, _, { models }: IContext) {
    if (!transaction.vatRowId) {
      return;
    }

    return await models.VatRows.findOne({ _id: transaction.vatRowId });
  },

  async ctaxRow(transaction: ITransactionDocument, _, { models }: IContext) {
    if (!transaction.ctaxRowId) {
      return;
    }

    return await models.CtaxRows.findOne({ _id: transaction.ctaxRowId });
  },
};
