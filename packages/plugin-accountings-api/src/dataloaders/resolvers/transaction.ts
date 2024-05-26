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
};
