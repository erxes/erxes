import { ITransaction, transactionSchema } from './definitions/transactions';
import { INVOICE_STATUS, SCHEDULE_STATUS } from './definitions/constants';
import { findContractOfTr } from './utils/findUtils';
import { generatePendingSchedules } from './utils/scheduleUtils';
import {
  getCalcedAmounts,
  removeTrAfterSchedule,
  trAfterSchedule,
  transactionRule
} from './utils/transactionUtils';
import { Model } from 'mongoose';
import { ITransactionDocument } from './definitions/transactions';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
import { IContractDocument } from './definitions/contracts';
import { getPureDate } from '@erxes/api-utils/src';
import { createEbarimt } from './utils/ebarimtUtils';
import { getFullDate } from './utils/utils';
import { getConfig, sendMessageBroker } from '../messageBroker';
import BigNumber from 'bignumber.js';
import { IConfig } from '../interfaces/config';
import {
  createTransactionSchedule,
  scheduleFixAfterCurrent
} from './utils/scheduleFixUtils';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(selector: FilterQuery<ITransactionDocument>);
  createTransaction(
    subdomain: string,
    doc: ITransaction
  ): Promise<ITransactionDocument>;
  updateTransaction(subdomain: any, _id: string, doc: ITransaction);
  changeTransaction(_id: string, doc: ITransaction, subdomain: any);
  removeTransactions(_ids: string[], subdomain: any);
  getPaymentInfo(
    id: string,
    payDate: Date,
    subdomain: string,
    scheduleDate?: Date
  );
  createEBarimtOnTransaction(
    subdomain: string,
    id: string,
    isGetEBarimt?: boolean,
    isOrganization?: boolean,
    organizationRegister?: string
  );
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
        throw new Error('Transaction not found');
      }

      return transaction;
    }

    /**
     * Create a transaction
     */
    public static async createTransaction(
      subdomain: string,
      {
        isGetEBarimt,
        isOrganization,
        organizationRegister,
        ...doc
      }: ITransaction
    ) {
      const periodLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.payDate }
      })
        .sort({ date: -1 })
        .lean();

      if (!doc.contractId) {
        throw new Error('Contract not selected');
      }

      if (periodLock && !periodLock?.excludeContracts.includes(doc.contractId))
        throw new Error(
          'At this moment transaction can not been created because this date closed'
        );

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean<IContractDocument>();

      if (!contract) {
        throw new Error('Contract not found');
      }

      if (!doc.currency && contract?.currency) {
        doc.currency = contract?.currency;
      }

      doc.number = `${contract.number}${new Date().getTime().toString()}`;

      if (doc.invoiceId) {
        const invoiceData: any = {
          status: INVOICE_STATUS.DONE
        };
        await models.Invoices.updateInvoice(doc.invoiceId, invoiceData);
      }

      if (doc.transactionType === 'give') {
        doc.give = doc.total;
        doc.contractReaction = contract;

        const schedule = await models.Schedules.create({
          contractId: contract._id,
          status: SCHEDULE_STATUS.GIVE,
          payDate: getFullDate(doc.payDate),
          balance: new BigNumber(doc.total || 0)
            .plus(contract?.loanBalanceAmount || 0)
            .toNumber(),
          interestNonce: 0,
          payment: 0,
          total: doc.total
        });

        await models.Contracts.updateOne(
          { _id: contract._id },
          { $inc: { givenAmount: doc.total, loanBalanceAmount: doc.total } }
        );

        doc.reactions = [
          {
            scheduleId: schedule._id
          }
        ];

        const tr = await models.Transactions.create({ ...doc });

        return tr;
      }

      const config: IConfig = await getConfig('loansConfig', subdomain);

      doc.payDate = getFullDate(doc.payDate);
      doc.contractReaction = contract;

      const tr = await models.Transactions.create({ ...doc });

      if ((tr.calcInterest || 0) > 0 && isEnabled('savings'))
        await sendMessageBroker(
          {
            action: 'block.create',
            subdomain,
            data: {
              customerId: contract.customerId,
              description: 'interest payment',
              blockType: 'scheduleTransaction',
              amount: tr.calcInterest,
              scheduleDate: tr.payDate,
              payDate: tr.payDate
            },
            isRPC: true
          },
          'savings'
        );

      await createTransactionSchedule(contract, tr.payDate, tr, models, config);
      await scheduleFixAfterCurrent(contract, tr.payDate, models, config);

      const contractType = await models.ContractTypes.findOne({
        _id: contract.contractTypeId
      });

      let updateContractInc = {};

      if (doc.storedInterest && doc.storedInterest > 0)
        updateContractInc = { storedInterest: doc.storedInterest * -1 };

      if (doc.payment && doc.payment > 0)
        updateContractInc = {
          ...updateContractInc,
          loanBalanceAmount: doc.payment * -1
        };

      await models.Contracts.updateOne(
        {
          _id: tr.contractId
        },
        { $inc: updateContractInc }
      );

      if (
        contractType?.config?.isAutoSendEBarimt === true ||
        (isGetEBarimt && doc.isManual)
      )
        await createEbarimt(
          models,
          subdomain,
          contractType?.config,
          tr,
          contract,
          { isGetEBarimt, isOrganization, organizationRegister }
        );

      return tr;
    }

    /**
     * Update Transaction
     */
    public static async updateTransaction(
      subdomain,
      _id: string,
      doc: ITransaction
    ) {
      doc = { ...doc, ...(await findContractOfTr(models, doc)) };

      const periodLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.payDate }
      })
        .sort({ date: -1 })
        .lean();

      if (periodLock && !periodLock?.excludeContracts.includes(doc.contractId))
        throw new Error(
          'At this moment transaction can not been created because this date closed'
        );

      const oldTr = await models.Transactions.getTransaction({
        _id
      });

      const config: IConfig = await getConfig('loansConfig', subdomain);

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean();
      if (!contract || !contract._id) {
        await models.Transactions.updateOne({ _id }, { $set: { ...doc } });
        return models.Transactions.getTransaction({ _id });
      }

      await removeTrAfterSchedule(models, oldTr, config);

      if (doc.invoiceId) {
        const invoiceData: any = {
          status: INVOICE_STATUS.DONE
        };
        await models.Invoices.updateInvoice(doc.invoiceId, invoiceData);
      }

      const trInfo = await transactionRule(models, subdomain, { ...doc });

      await models.Transactions.updateOne(
        { _id },
        { $set: { ...doc, ...trInfo } }
      );
      const newTr = await models.Transactions.getTransaction({
        _id
      });

      await trAfterSchedule(models, newTr);

      return newTr;
    }

    /**
     * ReConfig amounts or change Transaction
     */
    public static async changeTransaction(_id: string, doc, subdomain) {
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
          'At this moment transaction can not been created because this date closed'
        );

      const contract = await models.Contracts.findOne({
        _id: oldTr.contractId
      }).lean();

      if (!contract || !contract._id) {
        await models.Transactions.updateOne({ _id }, { $set: { ...doc } });
        return models.Transactions.getTransaction({ _id });
      }

      const oldSchedule = await models.Schedules.findOne({
        contractId: contract._id,
        transactionIds: { $in: [_id] }
      }).lean();

      const preSchedules = await models.Schedules.find({
        contractId: contract._id,
        payDate: { $lt: oldSchedule.payDate }
      }).lean();

      const noDeleteSchIds = preSchedules
        .map((item) => item._id)
        .concat([oldSchedule._id]);

      let trReaction = oldTr.reactions.filter((item) =>
        noDeleteSchIds.includes(item.scheduleId)
      );

      const config: IConfig = await getConfig('loansConfig', subdomain);

      await removeTrAfterSchedule(models, oldTr, config, noDeleteSchIds);

      const newTotal = new BigNumber(doc.payment ?? 0)
        .plus(doc.interestEve ?? 0)
        .plus(doc.interestNonce ?? 0)
        .plus(doc.loss ?? 0)
        .plus(doc.insurance ?? 0)
        .plus(doc.debt ?? 0);

      await models.Transactions.updateOne(
        { _id },
        { $set: { ...doc, total: newTotal } }
      );
      
      let newTr = await models.Transactions.getTransaction({ _id });

      const newBalance =
        oldSchedule.balance + oldSchedule.didPayment - doc.payment;

      await models.Schedules.updateOne(
        { _id: oldSchedule._id },
        {
          $set: {
            payment: doc.payment,
            interestEve: doc.interestEve,
            interestNonce: doc.interestNonce,
            loss: doc.loss,
            insurance: doc.insurance,
            debt: doc.debt,
            total: newTotal,

            didPayment: doc.payment,
            didInterestEve: doc.interestEve,
            didInterestNonce: doc.interestNonce,
            didLoss: doc.loss,
            didInsurance: doc.insurance,
            didDebt: doc.debt,
            didTotal: newTotal,

            balance: newBalance,
            status: SCHEDULE_STATUS.DONE
          }
        }
      );

      let updatedSchedule = await models.Schedules.findOne({
        _id: oldSchedule._id
      }).lean();

      const pendingSchedules = await models.Schedules.find({
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

        await models.Schedules.bulkWrite(bulkOps);
        await models.Transactions.updateOne(
          { _id: newTr._id },
          {
            $set: { reactions: trReaction }
          }
        );
      }

      return newTr;
    }

    /**
     * Remove Transaction
     */
    public static async removeTransactions(_ids, subdomain) {
      const transactions: ITransactionDocument[] =
        await models.Transactions.find({ _id: _ids })
          .sort({ payDate: -1 })
          .lean();

      const config: IConfig = await getConfig('loansConfig', subdomain);

      for await (const oldTr of transactions) {
        if (oldTr) {
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
              'At this moment transaction can not been created because this date closed'
            );

          await removeTrAfterSchedule(models, oldTr, config);

          oldTr.contractId &&
            (await models.Contracts.updateOne(
              { _id: oldTr.contractId },
              {
                $set: {
                  storedInterest: oldTr.calcedInfo?.storedInterest,
                  givenAmount: oldTr.contractReaction?.givenAmount
                }
              }
            ));
          await models.Transactions.deleteOne({ _id: oldTr._id });
        }
      }
    }

    public static async getPaymentInfo(id, payDate, subdomain) {
      const today = getPureDate(new Date(payDate));

      const config: IConfig = await getConfig('loansConfig', subdomain);

      const paymentInfo = await getCalcedAmounts(
        models,
        subdomain,
        {
          contractId: id,
          payDate: today
        },
        config
      );

      let {
        payment = 0,
        loss = 0,
        insurance = 0,
        debt = 0,
        balance = 0,
        commitmentInterest = 0,
        storedInterest = 0,
        calcInterest = 0
      } = paymentInfo;

      paymentInfo.total = new BigNumber(payment)
        .plus(loss)
        .plus(calcInterest)
        .plus(storedInterest)
        .plus(insurance)
        .plus(debt)
        .plus(commitmentInterest)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      paymentInfo.closeAmount = new BigNumber(balance)
        .plus(loss)
        .plus(calcInterest)
        .plus(storedInterest)
        .plus(insurance)
        .plus(debt)
        .plus(commitmentInterest)
        .dp(config.calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      return paymentInfo;
    }

    public static async createEBarimtOnTransaction(
      subdomain: string,
      id: string,
      isGetEBarimt?: boolean,
      isOrganization?: boolean,
      organizationRegister?: string
    ) {
      const tr = await models.Transactions.findOne({ _id: id });
      if (!tr) throw new Error('Transaction not found');
      const contract = await models.Contracts.findOne({ _id: tr?.contractId });
      if (!contract) throw new Error('Contract not found');
      const contractType = await models.ContractTypes.findOne({
        _id: contract?.contractTypeId
      });
      if (!contractType) throw new Error('Contract type not found');
      if (isGetEBarimt)
        await createEbarimt(
          models,
          subdomain,
          contractType?.config,
          tr,
          contract,
          { isGetEBarimt, isOrganization, organizationRegister }
        );

      return tr;
    }
  }
  transactionSchema.loadClass(Transaction);
  return transactionSchema;
};
