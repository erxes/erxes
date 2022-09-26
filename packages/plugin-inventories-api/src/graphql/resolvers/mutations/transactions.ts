import { IContext } from '../../../connectionResolver';
import { ITransactionCreateParams } from '../../../models/definitions/transactions';
import { updateLiveRemainders } from './utils';

const transactionMutations = {
  transactionAdd: async (
    _root: any,
    params: ITransactionCreateParams,
    { subdomain, models }: IContext
  ) => {
    return await models.Transactions.createTransaction(params);
  }
};

export default transactionMutations;
