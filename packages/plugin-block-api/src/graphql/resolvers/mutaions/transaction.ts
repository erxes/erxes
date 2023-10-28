import { IContext } from '../../../connectionResolver';
import { ITransaction } from '../../../models/definitions/transactions';

const transactionMutations = {
  /**
   * Creates a new transaction
   */
  async transactionsAdd(
    _root,
    doc: ITransaction,
    { subdomain, models }: IContext
  ) {
    const transaction = await models.Transactions.createTransaction(doc);

    return transaction;
  }
};

// requireLogin(transactionMutations, 'transactionsAdd');

export default transactionMutations;
