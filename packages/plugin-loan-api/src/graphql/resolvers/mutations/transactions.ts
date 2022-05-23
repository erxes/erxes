import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import { gatherDescriptions } from '../../../utils';
import { checkPermission } from '@erxes/api-utils/src';

const transactionMutations = {
  transactionsAdd: async (
    _root,
    doc,
    { user, docModifier, models, checkPermission, memoryStorage, messageBroker }
  ) => {
    const transaction = models.Transactions.createTransaction(
      models,
      messageBroker,
      memoryStorage,
      docModifier(doc),
      user
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'transaction',
        newData: doc,
        object: transaction,
        extraParams: { models }
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
    { _id, ...doc },
    { models, checkPermission, memoryStorage, user, messageBroker }
  ) => {
    const transaction = await models.Transactions.getTransaction(models, {
      _id
    });

    const updated = await models.Transactions.updateTransaction(
      models,
      messageBroker,
      memoryStorage,
      _id,
      doc
    );

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'transaction',
        object: transaction,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
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
    { _id, ...doc },
    { models, checkPermission, memoryStorage, user, messageBroker }
  ) => {
    const transaction = await models.Transactions.getTransaction(models, {
      _id
    });

    const updated = await models.Transactions.changeTransaction(
      models,
      messageBroker,
      memoryStorage,
      _id,
      doc
    );

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'transaction',
        object: transaction,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
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
    { models, checkPermission, user, messageBroker }
  ) => {
    // TODO: contracts check
    const transactions = await models.Transactions.find({
      _id: { $in: transactionIds }
    }).lean();

    await models.Transactions.removeTransactions(models, transactionIds);

    for (const transaction of transactions) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'transaction', object: transaction, extraParams: { models } },
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
  'manageTransactions'
);

export default transactionMutations;
