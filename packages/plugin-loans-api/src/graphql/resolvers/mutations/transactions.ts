import { gatherDescriptions } from '../../../utils';
import {
  checkPermission,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import messageBroker from '../../../messageBroker';
import redis from '../../../redis';
import {
  ITransaction,
  ITransactionDocument
} from '../../../models/definitions/transactions';

const transactionMutations = {
  transactionsAdd: async (
    _root,
    doc: ITransaction,
    { user, models, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.createTransaction(
      subdomain,
      doc
    );

    const logData = {
      type: 'transaction',
      newData: doc,
      object: transaction,
      extraParams: { models }
    };

    const descriptions = gatherDescriptions(logData);

    await putCreateLog(
      subdomain,
      messageBroker,
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return transaction;
  },

  /**
   * Updates a transaction
   */

  transactionsEdit: async (
    _root,
    { _id, ...doc }: ITransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.getTransaction({
      _id
    });

    const updated = await models.Transactions.updateTransaction(
      redis,
      _id,
      doc
    );

    const logData = {
      type: 'transaction',
      object: transaction,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    const descriptions = gatherDescriptions(logData);

    await putUpdateLog(
      subdomain,
      messageBroker,
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return updated;
  },

  /**
   * Change a transaction
   */

  transactionsChange: async (
    _root,
    { _id, ...doc }: ITransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.getTransaction({
      _id
    });

    const updated = await models.Transactions.changeTransaction(_id, doc);

    const logData = {
      type: 'transaction',
      object: transaction,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    const descriptions = gatherDescriptions(logData);

    await putUpdateLog(
      subdomain,
      messageBroker,
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return updated;
  },

  /**
   * Removes transactions
   */

  transactionsRemove: async (
    _root,
    { transactionIds }: { transactionIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check
    const transactions = await models.Transactions.find({
      _id: { $in: transactionIds }
    }).lean();

    await models.Transactions.removeTransactions(transactionIds);

    for (const transaction of transactions) {
      const logData = {
        type: 'transaction',
        object: transaction,
        extraParams: { models }
      };

      const descriptions = gatherDescriptions(logData);

      await putDeleteLog(
        subdomain,
        messageBroker,

        { ...logData, ...descriptions },
        user
      );
    }

    return transactionIds;
  }
};
checkPermission(transactionMutations, 'transactionsAdd', 'manageTransactions');
checkPermission(transactionMutations, 'transactionsEdit', 'manageTransactions');
checkPermission(
  transactionMutations,
  'transactionsChange',
  'manageTransactions'
);
checkPermission(
  transactionMutations,
  'transactionsRemove',
  'transactionsRemove'
);

export default transactionMutations;
