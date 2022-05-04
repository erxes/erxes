import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import { gatherDescriptions } from '../../../utils';

const transactionMutations = {
  transactionsAdd: async (
    _root,
    doc,
    { user, docModifier, models, checkPermission, memoryStorage, messageBroker }
  ) => {
    await checkPermission('manageTransactions', user);

    const transaction = models.LoanTransactions.createTransaction(
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
        extraParams: { models },
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
    await checkPermission('manageTransactions', user);
    const transaction = await models.LoanTransactions.getTransaction(models, {
      _id,
    });

    const updated = await models.LoanTransactions.updateTransaction(
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
        extraParams: { models },
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
    await checkPermission('manageTransactions', user);
    const transaction = await models.LoanTransactions.getTransaction(models, {
      _id,
    });

    const updated = await models.LoanTransactions.changeTransaction(
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
        extraParams: { models },
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
    await checkPermission('manageTransactions', user);
    // TODO: contracts check
    const transactions = await models.LoanTransactions.find({
      _id: { $in: transactionIds },
    }).lean();

    await models.LoanTransactions.removeTransactions(models, transactionIds);

    for (const transaction of transactions) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'transaction', object: transaction, extraParams: { models } },
        user
      );
    }

    return transactionIds;
  },
};

export default transactionMutations;
