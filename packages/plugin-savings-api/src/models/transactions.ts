import { ITransaction, transactionSchema } from "./definitions/transactions";
import { findContractOfTr } from "./utils/findUtils";
import {
  checkTransactionValidation,
  removeTrAfterSchedule,
  transactionDealt
} from "./utils/transactionUtils";
import { Model } from "mongoose";
import { ITransactionDocument } from "./definitions/transactions";
import { IModels } from "../connectionResolver";
import { FilterQuery } from "mongoose";
import { IContractDocument } from "./definitions/contracts";
import { TRANSACTION_TYPE } from "./definitions/constants";

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(selector: FilterQuery<ITransactionDocument>);
  createTransaction(
    doc: ITransaction,
    subdomain?: string
  ): Promise<ITransactionDocument>;
  updateTransaction(_id: string, doc: ITransaction);
  changeTransaction(_id: string, doc: ITransaction);
  removeTransactions(_ids: string[]);
}
export const loadTransactionClass = (models: IModels) => {
  class Transaction {
    /**
     *
     * Get Transaction
     */

    public static async getTransaction(
      selector: FilterQuery<ITransactionDocument>
    ) {
      const transaction = await models.Transactions.findOne(selector);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      return transaction;
    }

    /**
     * Create a transaction
     */
    public static async createTransaction(
      doc: ITransaction,
      subdomain?: string
    ) {
      doc = { ...doc, ...(await findContractOfTr(models, doc)) };

      const periodLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.payDate }
      })
        .sort({ date: -1 })
        .lean();

      await checkTransactionValidation(periodLock, doc, subdomain);

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean<IContractDocument>();

      if (!contract) throw new Error("Contract not found");

      if (!doc.currency && contract?.currency) {
        doc.currency = contract?.currency;
      }

      if (!contract || !contract._id) {
        return models.Transactions.create({ ...doc });
      }

      doc.number = `${contract.number}${new Date().getTime().toString()}`;
      doc.payment = doc.total;
      doc.balance = contract.savingAmount;

      switch (doc.transactionType) {
        case TRANSACTION_TYPE.INCOME:
          await models.Contracts.updateOne(
            { _id: contract._id },
            { $inc: { savingAmount: doc.payment || 0 } }
          );
          break;
        case TRANSACTION_TYPE.OUTCOME:
          await models.Contracts.updateOne(
            { _id: contract._id },
            { $inc: { savingAmount: (doc.payment || 0) * -1 } }
          );
          if (doc.dealtType) {
            doc.dealtResponse = await transactionDealt(
              { ...doc },
              models,
              subdomain
            );
          }
          break;

        default:
          break;
      }

      const tr = await models.Transactions.create({ ...doc });

      return tr;
    }

    /**
     * Update Transaction
     */
    public static async updateTransaction(_id: string, doc: ITransaction) {
      doc = { ...doc, ...(await findContractOfTr(models, doc)) };

      const periodLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.payDate }
      })
        .sort({ date: -1 })
        .lean();

      if (
        periodLock &&
        !periodLock?.excludeContracts.includes(doc.contractId || "undefined")
      ) {
        throw new Error(
          "At this moment transaction can not been created because this date closed"
        );
      }

      const oldTr = await models.Transactions.getTransaction({
        _id
      });

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean();
      if (!contract || !contract._id) {
        await models.Transactions.updateOne({ _id }, { $set: { ...doc } });
        return models.Transactions.getTransaction({ _id });
      }

      await removeTrAfterSchedule(models, oldTr);

      const newTr = await models.Transactions.getTransaction({
        _id
      });

      return newTr;
    }

    /**
     * ReConfig amounts or change Transaction
     */
    public static async changeTransaction(_id: string, doc) {
      const oldTr = await models.Transactions.getTransaction({
        _id
      });

      const periodLock = await models.PeriodLocks.findOne({
        date: { $gte: oldTr.payDate }
      })
        .sort({ date: -1 })
        .lean();

      if (
        periodLock &&
        !periodLock?.excludeContracts.includes(oldTr.contractId)
      )
        throw new Error(
          "At this moment transaction can not been created because this date closed"
        );

      const contract = await models.Contracts.findOne({
        _id: oldTr.contractId
      }).lean();

      if (!contract || !contract._id) {
        await models.Transactions.updateOne({ _id }, { $set: { ...doc } });
        return models.Transactions.getTransaction({ _id });
      }

      const newTotal = doc.payment || 0;

      await models.Transactions.updateOne(
        { _id },
        { $set: { ...doc, total: newTotal } }
      );
      let newTr = await models.Transactions.getTransaction({ _id });

      return newTr;
    }

    /**
     * Remove Transaction
     */
    public static async removeTransactions(_ids) {
      const transactions: ITransactionDocument[] =
        await models.Transactions.find({ _id: _ids })
          .sort({ payDate: -1 })
          .lean();

      for await (const oldTr of transactions) {
        if (oldTr) {
          const periodLock = await models.PeriodLocks.findOne({
            date: { $gte: oldTr.payDate }
          })
            .sort({ date: -1 })
            .lean();

          if (
            periodLock &&
            !periodLock?.excludeContracts.includes(
              oldTr.contractId || "undefined"
            )
          )
            throw new Error(
              "At this moment transaction can not been created because this date closed"
            );

          if (oldTr.contractId) {
            await models.Contracts.updateOne(
              { _id: oldTr.contractId },
              { $set: { savingAmount: oldTr.contractReaction?.savingAmount } }
            );
          }

          await models.Transactions.deleteOne({ _id: oldTr._id });
        }
      }
    }
  }
  transactionSchema.loadClass(Transaction);
  return transactionSchema;
};
