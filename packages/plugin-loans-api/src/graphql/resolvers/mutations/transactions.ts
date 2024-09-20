import { checkPermission } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";
import { sendMessageBroker } from "../../../messageBroker";
import {
  ITransaction,
  ITransactionDocument
} from "../../../models/definitions/transactions";
import { createLog, deleteLog, updateLog } from "../../../logUtils";
import { loansSchedulesChanged } from "./schedules";

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

    if (transaction.contractId) {
      await loansSchedulesChanged(transaction.contractId);
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

  clientTransactionsAdd: async (
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
      subdomain,
      doc
    );

    if (transaction.contractId) {
      await loansSchedulesChanged(transaction.contractId);
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

    if (updated.contractId) {
      await loansSchedulesChanged(updated.contractId);
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

  transactionsChange: async (
    _root,
    { _id, ...doc }: ITransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const transaction = await models.Transactions.getTransaction({
      _id
    });

    const updated = await models.Transactions.changeTransaction(
      _id,
      doc,
      subdomain
    );

    if (updated.contractId) {
      await loansSchedulesChanged(updated.contractId);
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

  transactionsRemove: async (
    _root,
    { transactionIds }: { transactionIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check

    const transactions = await models.Transactions.find({
      _id: { $in: transactionIds }
    }).lean();

    await models.Transactions.removeTransactions(
      transactions.map((a) => a._id),
      subdomain
    );

    for (const transaction of transactions) {
      const logData = {
        type: "transaction",
        object: transaction,
        extraParams: { models }
      };

      if (!!transaction.ebarimt && transaction.isManual) {
        await sendMessageBroker(
          {
            action: "putresponses.returnBill",
            data: {
              contentType: "loans:transaction",
              contentId: transaction._id,
              number: transaction.number
            },
            subdomain
          },
          "ebarimt"
        );
      }

      if (transaction.contractId) {
        await loansSchedulesChanged(transaction.contractId);
      }

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
