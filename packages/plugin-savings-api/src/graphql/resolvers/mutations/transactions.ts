import { checkPermission } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";
import { sendMessageBroker } from "../../../messageBroker";
import {
  ITransaction,
  ITransactionDocument
} from "../../../models/definitions/transactions";
import { createLog, deleteLog, updateLog } from "../../../logUtils";
import { savingsContractChanged } from "./contracts";

const transactionMutations = {
  savingsTransactionsAdd: async (
    _root,
    doc: ITransaction,
    { user, models, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.createTransaction(
      doc,
      subdomain
    );

    if (transaction.contractId) {
      const contract = await models.Contracts.findOne({ _id: transaction.contractId });
      if (contract) {
        await savingsContractChanged(contract);
      }
    }

    const logData = {
      type: "transaction",
      newData: doc,
      object: transaction,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return transaction;
  },

  clientSavingsTransactionsAdd: async (
    _root,
    doc: ITransaction & { secondaryPassword: string },
    { user, models, subdomain }: IContext
  ) => {
    const validate = await sendMessageBroker(
      {
        subdomain,
        action: "clientPortalUsers.validatePassword",
        data: {
          userId: doc.customerId,
          password: doc.secondaryPassword,
          secondary: true
        }
      },
      "clientportal"
    );

    if (validate?.status === "error") {
      throw new Error(validate.errorMessage);
    }

    const transaction = await models.Transactions.createTransaction(
      doc,
      subdomain
    );

    if (transaction.contractId) {
      const contract = await models.Contracts.findOne({ _id: transaction.contractId });
      if (contract) {
        await savingsContractChanged(contract);
      }
    }

    const logData = {
      type: "transaction",
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

  savingsTransactionsEdit: async (
    _root,
    { _id, ...doc }: ITransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.getTransaction({
      _id
    });

    const updated = await models.Transactions.updateTransaction(_id, doc);

    if (updated.contractId) {
      const contract = await models.Contracts.findOne({ _id: updated.contractId });
      if (contract) {
        await savingsContractChanged(contract);
      }
    }

    const logData = {
      type: "transaction",
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

  savingsTransactionsChange: async (
    _root,
    { _id, ...doc }: ITransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.getTransaction({
      _id
    });

    const updated = await models.Transactions.changeTransaction(_id, doc);

    if (updated.contractId) {
      const contract = await models.Contracts.findOne({ _id: updated.contractId });
      if (contract) {
        await savingsContractChanged(contract);
      }
    }
    const logData = {
      type: "transaction",
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

  savingsTransactionsRemove: async (
    _root,
    { transactionIds }: { transactionIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check
    const transactions = await models.Transactions.find({
      _id: transactionIds
    }).lean();

    await models.Transactions.removeTransactions(
      transactions.map((a) => a._id)
    );

    for (const transaction of transactions) {
      const logData = {
        type: "transaction",
        object: transaction,
        extraParams: { models }
      };

      if (transaction.contractId) {
        const contract = await models.Contracts.findOne({ _id: transaction.contractId });
        if (contract) {
          await savingsContractChanged(contract);
        }
      }

      // if (transaction.ebarimt && transaction.isManual){
      //   await sendMessageBroker(
      //     {
      //       action: 'putresponses.returnBill',
      //       data: {
      //         contentType: 'savings:transaction',
      //         contentId: transaction._id,
      //         number: transaction.number
      //       },
      //       subdomain
      //     },
      //     'ebarimt'
      //   );
      // }

      await deleteLog(subdomain, user, logData);
    }

    return transactionIds;
  }
};
checkPermission(transactionMutations, "transactionsAdd", "manageTransactions");
checkPermission(transactionMutations, "transactionsEdit", "manageTransactions");
checkPermission(
  transactionMutations,
  "transactionsChange",
  "manageTransactions"
);
checkPermission(
  transactionMutations,
  "transactionsRemove",
  "transactionsRemove"
);

export default transactionMutations;
