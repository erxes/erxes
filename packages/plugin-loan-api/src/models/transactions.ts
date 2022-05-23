import { transactionSchema } from './definitions/transactions';
import { ConfirmTrBase } from './utils/confirmTrUtils';
import { INVOICE_STATUS, SCHEDULE_STATUS } from './definitions/constants';
import { findContractOfTr } from './utils/findUtils';
import { generatePendingSchedules } from './utils/scheduleUtils';
import {
  removeTrAfterSchedule,
  trAfterSchedule,
  transactionRule
} from './utils/transactionUtils';
import { Model } from 'mongoose';
import { ITransactionDocument } from '../models/definitions/transactions';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(models, selector: any);
  createTransaction(models, messageBroker, memoryStorage, doc);
  updateTransaction(models, messageBroker, memoryStorage, _id, doc);
  changeTransaction(models, messageBroker, memoryStorage, _id, doc);
  removeTransactions(models, _ids);
}
export const loadTransactionClass = models => {
  class Transaction {
    /**
     *
     * Get Transaction
     */

    public static async getTransaction(selector: any) {
      const transaction = await models.Transactions.findOne(selector);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    }

    /**
     * Create a transaction
     */
    public static async createTransaction(messageBroker, memoryStorage, doc) {
      doc = { ...doc, ...(await findContractOfTr(models, doc)) };

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean();
      if (!contract || !contract._id) {
        return models.Transactions.create({ ...doc });
      }

      if (doc.invoiceId) {
        await models.Invoices.updateInvoice(models, doc.invoiceId, {
          status: INVOICE_STATUS.DONE
        });
      }

      const trInfo = await transactionRule(models, memoryStorage, { ...doc });
      const tr = await models.Transactions.create({ ...doc, ...trInfo });

      await trAfterSchedule(models, tr);

      ConfirmTrBase(models, messageBroker, memoryStorage, contract, tr);

      return tr;
    }

    /**
     * Update Transaction
     */
    public static async updateTransaction(
      messageBroker,
      memoryStorage,
      _id,
      doc
    ) {
      doc = { ...doc, ...(await findContractOfTr(models, doc)) };

      const oldTr = await models.Transactions.getTransaction(models, {
        _id
      });

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean();
      if (!contract || !contract._id) {
        await models.Transactions.updateOne({ _id }, { $set: { ...doc } });
        return models.Transactions.getTransaction(models, { _id });
      }

      await removeTrAfterSchedule(models, oldTr);

      if (doc.invoiceId) {
        await models.Invoices.updateInvoice(models, doc.invoiceId, {
          status: INVOICE_STATUS.DONE
        });
      }

      const trInfo = await transactionRule(models, memoryStorage, { ...doc });

      await models.Transactions.updateOne(
        { _id },
        { $set: { ...doc, ...trInfo } }
      );
      const newTr = await models.Transactions.getTransaction(models, {
        _id
      });

      await trAfterSchedule(models, newTr);

      ConfirmTrBase(models, messageBroker, memoryStorage, contract, newTr);
      return newTr;
    }

    /**
     * ReConfig amounts or change Transaction
     */
    public static async changeTransaction(
      messageBroker,
      memoryStorage,
      _id,
      doc
    ) {
      const oldTr = await models.Transactions.getTransaction(models, {
        _id
      });

      const contract = await models.Contracts.findOne({
        _id: oldTr.contractId
      }).lean();
      if (!contract || !contract._id) {
        await models.Transactions.updateOne({ _id }, { $set: { ...doc } });
        return models.Transactions.getTransaction(models, { _id });
      }

      const oldSchedule = await models.RepaymentSchedules.findOne({
        contractId: contract._id,
        transactionIds: { $in: [_id] }
      }).lean();

      const preSchedules = await models.RepaymentSchedules.find({
        contractId: contract._id,
        payDate: { $lt: oldSchedule.payDate }
      }).lean();

      const noDeleteSchIds = preSchedules
        .map(item => item._id)
        .concat([oldSchedule._id]);

      let trReaction = oldTr.reactions.filter(item =>
        noDeleteSchIds.includes(item.scheduleId)
      );

      await removeTrAfterSchedule(models, oldTr, noDeleteSchIds);

      const newTotal =
        (doc.payment || 0) +
        (doc.interestEve || 0) +
        (doc.interestNonce || 0) +
        (doc.undue || 0) +
        (doc.insurance || 0) +
        (doc.debt || 0);

      await models.Transactions.updateOne(
        { _id },
        { $set: { ...doc, total: newTotal } }
      );
      let newTr = await models.Transactions.getTransaction(models, { _id });

      const newBalance =
        oldSchedule.balance + oldSchedule.didPayment - doc.payment;

      await models.RepaymentSchedules.updateOne(
        { _id: oldSchedule._id },
        {
          $set: {
            payment: doc.payment,
            interestEve: doc.interestEve,
            interestNonce: doc.interestNonce,
            undue: doc.undue,
            insurance: doc.insurance,
            debt: doc.debt,
            total: newTotal,

            didPayment: doc.payment,
            didInterestEve: doc.interestEve,
            didInterestNonce: doc.interestNonce,
            didUndue: doc.undue,
            didInsurance: doc.insurance,
            didDebt: doc.debt,
            didTotal: newTotal,

            balance: newBalance,
            status: SCHEDULE_STATUS.DONE
          }
        }
      );

      let updatedSchedule = await models.RepaymentSchedules.findOne({
        _id: oldSchedule._id
      }).lean();

      const pendingSchedules = await models.RepaymentSchedules.find({
        contractId: contract._id,
        status: SCHEDULE_STATUS.PENDING
      })
        .sort({ payDate: 1 })
        .lean();

      // changed balance then after schedules are change
      if (oldSchedule.balance !== newBalance) {
        await generatePendingSchedules(
          models,
          contract,
          { ...updatedSchedule },
          pendingSchedules,
          newTr,
          trReaction
        );
      }

      // after schedules added debt
      if (doc.futureDebt && doc.debtTenor) {
        const bulkOps: Array<{
          updateOne: {
            filter: { _id: string };
            update: { $set: any };
          };
        }> = [];

        newTr = await models.Transactions.findOne({
          _id: newTr._id
        }).lean();
        trReaction = newTr.reactions;

        const origTenor = Math.min(doc.debtTenor, pendingSchedules.length);
        const perDebt = Math.round(doc.futureDebt / origTenor);
        const firstDebt = doc.futureDebt - perDebt * (origTenor - 1);
        let indexOfMonth = 0;
        for (const sch of pendingSchedules) {
          indexOfMonth = indexOfMonth + 1;
          if (indexOfMonth > origTenor) {
            break;
          }

          trReaction.push({
            scheduleId: sch._id,
            preData: { debt: sch.debt, total: sch.total }
          });

          const monthDebt = indexOfMonth === 1 ? firstDebt : perDebt;
          bulkOps.push({
            updateOne: {
              filter: { _id: sch._id },
              update: {
                $set: {
                  debt: (sch.debt || 0) + monthDebt,
                  total: (sch.total || 0) + monthDebt
                }
              }
            }
          });
        }

        await models.RepaymentSchedules.bulkWrite(bulkOps);
        await models.Transactions.updateOne(
          { _id: newTr._id },
          {
            $set: { reactions: trReaction }
          }
        );
      }

      ConfirmTrBase(models, messageBroker, memoryStorage, contract, newTr);
      return newTr;
    }

    /**
     * Remove Transaction
     */
    public static async removeTransactions(_ids) {
      for (const _id of _ids) {
        const oldTr = await models.Transactions.findOne({ _id });

        if (oldTr) {
          await removeTrAfterSchedule(models, oldTr);
        }
      }

      return models.Transactions.deleteMany({ _id: { $in: _ids } });
    }
  }
  transactionSchema.loadClass(Transaction);
  return transactionSchema;
};
