import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendMessageBroker } from '../../../messageBroker';
import {
  ITransaction,
  ITransactionDocument
} from '../../../models/definitions/transactions';
import { createLog, deleteLog, updateLog } from '../../../logUtils';

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

    await createLog(subdomain, user, logData);

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
      subdomain,
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

    await updateLog(subdomain, user, logData);

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

    await updateLog(subdomain, user, logData);

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
      _id: { $in: transactionIds },
      isManual: true
    }).lean();

    await models.Transactions.removeTransactions(transactions.map(a => a._id));

    for (const transaction of transactions) {
      const logData = {
        type: 'transaction',
        object: transaction,
        extraParams: { models }
      };

      if (!!transaction.ebarimt && transaction.isManual)
        await sendMessageBroker(
          {
            action: 'putresponses.returnBill',
            data: {
              contentType: 'loans:transaction',
              contentId: transaction._id
            },
            subdomain
          },
          'ebarimt'
        );

      await deleteLog(subdomain, user, logData);
    }

    return transactionIds;
  },
  createEBarimtOnTransaction: async (
    _root,
    {
      id,
      isGetEBarimt,
      isOrganization,
      organizationRegister
    }: {
      id: string;
      isGetEBarimt?: boolean;
      isOrganization?: boolean;
      organizationRegister?: string;
    },
    { models, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.createEBarimtOnTransaction(
      subdomain,
      id,
      isGetEBarimt,
      isOrganization,
      organizationRegister
    );

    return transaction;
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
