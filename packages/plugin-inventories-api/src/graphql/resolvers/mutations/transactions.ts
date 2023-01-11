import { IContext } from '../../../connectionResolver';
import { ITransactionInput } from '../../../models/definitions/transactions';
import { updateLiveRemainders } from './utils';

const transactionMutations = {
  transactionAdd: async (
    _root: any,
    doc: ITransactionInput,
    { subdomain, models, user }: IContext
  ) => {
    return await models.Transactions.createTransaction({
      ...doc,
      createdAt: new Date(),
      createdBy: user._id
    });
  }
};

export default transactionMutations;
