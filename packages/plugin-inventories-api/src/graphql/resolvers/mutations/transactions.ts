import { IContext } from '../../../connectionResolver';
import { ITransactionCreateParams } from '../../../models/definitions/transactions';

const transactionMutations = {
  transactionAdd: async (
    _root: any,
    params: ITransactionCreateParams,
    { models }: IContext
  ) => {
    return await models.Transactions.createTransaction(params);
  }
};

export default transactionMutations;
