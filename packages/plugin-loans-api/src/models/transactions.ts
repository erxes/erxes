import { ITransaction, transactionSchema } from "./definitions/transactions";
import { INVOICE_STATUS } from "./definitions/constants";
import { findContractOfTr } from "./utils/findUtils";
import {
  removeTrAfterSchedule,
  trAfterSchedule,
  transactionRule
} from "./utils/transactionUtils";
import { Model } from "mongoose";
import { ITransactionDocument } from "./definitions/transactions";
import { IModels } from "../connectionResolver";
import { FilterQuery } from "mongoose";
import { IContractDocument } from "./definitions/contracts";
import { createEbarimt } from "./utils/ebarimtUtils";
import { getFullDate } from "./utils/utils";
import { getConfig, sendMessageBroker } from "../messageBroker";
import BigNumber from "bignumber.js";
import { IConfig } from "../interfaces/config";
import {
  createTransactionSchedule,
  scheduleFixAfterCurrent
} from "./utils/scheduleFixUtils";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { getCalcedAmountsOnDate } from "./utils/calcHelpers";
import { trInSchedule } from "./utils/calcUtils";

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
        throw new Error("Transaction not found");
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
      const tr = await models.Transactions.create({ ...doc });

      const periodLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.payDate }
      })
        .sort({ date: -1 })
        .lean();

      const config: IConfig = await getConfig("loansConfig", subdomain);

      if (!doc.contractId) {
        throw new Error("Contract not selected");
      }

      if (periodLock && !periodLock?.excludeContracts.includes(doc.contractId))
        throw new Error(
          "At this moment transaction can not been created because this date closed"
        );

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean<IContractDocument>();

      if (!contract) {
        throw new Error("Contract not found");
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

      if (doc.transactionType === "give") {
        if (!config.loanGiveLimit) {
          throw new Error("Loan give limit not configured");
        }

        if (config.loanGiveLimit < doc.total) {
          throw new Error("The limit is exceeded");
        }
      }

      doc.payDate = getFullDate(doc.payDate);
      doc.contractReaction = contract;

      if ((tr.calcInterest || 0) > 0 && isEnabled("savings") && contract.depositAccountId) {
        await sendMessageBroker(
          {
            action: "block.create",
            subdomain,
            data: {
              customerId: contract.customerId,
              accountId: contract.depositAccountId,
              description: "interest payment",
              blockType: "scheduleTransaction",
              amount: tr.calcInterest,
              scheduleDate: tr.payDate,
              payDate: tr.payDate
            },
            isRPC: true
          },
          "savings"
        );
      }

      await trInSchedule(subdomain, models, contract, tr);

      const contractType = await models.ContractTypes.findOne({
        _id: contract.contractTypeId
      });

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

      if (
        periodLock &&
        !periodLock?.excludeContracts.includes(doc.contractId || "undefined")
      )
        throw new Error(
          "At this moment transaction can not been created because this date closed"
        );

      const oldTr = await models.Transactions.getTransaction({
        _id
      });

      const config: IConfig = await getConfig("loansConfig", subdomain);

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
          "At this moment transaction can not been created because this date closed"
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

      if (!oldSchedule) {
        throw new Error("Schedule not found");
      }

      const preSchedules = await models.Schedules.find({
        contractId: contract._id,
        payDate: { $lt: oldSchedule.payDate }
      }).lean();

      const noDeleteSchIds = preSchedules
        .map((item) => item._id)
        .concat([oldSchedule._id]);

      const config: IConfig = await getConfig("loansConfig", subdomain);

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

      await createTransactionSchedule(
        contract,
        newTr.payDate,
        newTr,
        models,
        config
      );
      await scheduleFixAfterCurrent(contract, newTr.payDate, models, config);

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

      const config: IConfig = await getConfig("loansConfig", subdomain);

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

          await removeTrAfterSchedule(models, oldTr, config);

          oldTr.contractId &&
            (await models.Contracts.updateOne(
              { _id: oldTr.contractId },
              {
                $set: oldTr.contractReaction
              }
            ));
          await models.Transactions.deleteOne({ _id: oldTr._id });
        }
      }
    }

    public static async getPaymentInfo(id, payDate, subdomain) {
      const today = getFullDate(new Date(payDate));

      const config: IConfig = await getConfig("loansConfig", subdomain);

      const contract = await models.Contracts.getContract({ _id: id });
      const paymentInfo = await getCalcedAmountsOnDate(models, contract, today, config.calculationFixed);
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
      if (!tr) throw new Error("Transaction not found");
      const contract = await models.Contracts.findOne({ _id: tr?.contractId });
      if (!contract) throw new Error("Contract not found");
      const contractType = await models.ContractTypes.findOne({
        _id: contract?.contractTypeId
      });
      if (!contractType) throw new Error("Contract type not found");
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
