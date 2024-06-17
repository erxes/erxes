import {
  CONTRACT_STATUS,
  LEASE_TYPES,
  REPAYMENT,
  SCHEDULE_STATUS
} from "./definitions/constants";
import {
  contractSchema,
  ICloseVariable,
  IContract,
  IContractDocument,
  IInsurancesData,
  ICollateralData
} from "./definitions/contracts";
import { getCloseInfo } from "./utils/closeUtils";
import {
  addMonths,
  calcInterest,
  getDiffDay,
  getFullDate,
  getNumber
} from "./utils/utils";
import { Model, FilterQuery } from "mongoose";
import { IModels } from "../connectionResolver";
import { ITransaction } from "./definitions/transactions";
import BigNumber from "bignumber.js";
import { getConfig, sendMessageBroker } from "../messageBroker";
import { IConfig } from "../interfaces/config";

const getInsurancAmount = (
  insurancesData: IInsurancesData[],
  collateralsData: ICollateralData[]
) => {
  let result = 0;
  for (const data of insurancesData) {
    result += parseFloat((data.amount || 0).toString());
  }

  for (const data of collateralsData) {
    result += parseFloat((data.insuranceAmount || 0).toString());
  }
  return result;
};
export interface IContractModel extends Model<IContractDocument> {
  getContract(
    selector: FilterQuery<IContractDocument>
  ): Promise<IContractDocument>;
  createContract(doc: IContract): Promise<IContractDocument>;
  updateContract(_id, doc: IContract): Promise<IContractDocument>;
  closeContract(subdomain, doc: ICloseVariable);
  clientCreditLoanRequest(
    subdomain,
    requestParams: { contractId: string; amount: number; customerId: string },
    contract: IContractDocument
  );
  removeContracts(_ids);
}

export const loadContractClass = (models: IModels) => {
  class Contract {
    /**
     *
     * Get Contract
     */

    public static async getContract(
      selector: FilterQuery<IContractDocument>
    ): Promise<IContractDocument> {
      const contract = await models.Contracts.findOne(selector);

      if (!contract) {
        throw new Error("Contract not found");
      }

      return contract;
    }

    /**
     * Create a contract
     */
    public static async createContract({
      schedule,
      ...doc
    }: IContract & { schedule: any }): Promise<IContractDocument> {
      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.lastStoredDate = getFullDate(doc.startDate || new Date());
      doc.firstPayDate = getFullDate(doc.firstPayDate);
      doc.mustPayDate = getFullDate(doc.firstPayDate);
      doc.lastStoredDate.setDate(doc.lastStoredDate.getDate() + 1);
      doc.endDate =
        doc.endDate ?? addMonths(new Date(doc.startDate), doc.tenor);
      if (!doc.useManualNumbering || !doc.number)
        doc.number = await getNumber(models, doc.contractTypeId);

      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
        doc.collateralsData || []
      );

      if (doc.repayment === REPAYMENT.CUSTOM && !schedule) {
        throw new Error("Custom graphic not exists");
      }

      const contract = await models.Contracts.create(doc);

      if (doc.repayment === REPAYMENT.CUSTOM && schedule.length > 0) {
        const schedules = schedule.map((a) => {
          return {
            contractId: contract._id,
            status: SCHEDULE_STATUS.PENDING,
            payDate: a.payDate,

            balance: a.balance,
            interestNonce: a.interestNonce,
            payment: a.payment,
            total: a.total
          };
        });

        await models.FirstSchedules.insertMany(schedules);
        await models.Schedules.insertMany(schedules);
      }

      if (
        doc.leaseType === LEASE_TYPES.LINEAR ||
        doc.leaseType === LEASE_TYPES.SAVING
      ) {
        const diffDays = getDiffDay(doc.startDate, doc.endDate);

        const interest = calcInterest({
          balance: doc.leaseAmount,
          interestRate: doc.interestRate,
          dayOfMonth: diffDays
        });

        const schedules = [
          {
            contractId: contract._id,
            status: SCHEDULE_STATUS.PENDING,
            payDate: doc.endDate,
            balance: doc.leaseAmount,
            interestNonce: interest,
            payment: doc.leaseAmount,
            total: doc.leaseAmount
          }
        ];

        await models.FirstSchedules.insertMany(schedules);
      }

      return contract;
    }

    /**
     * Update Contract
     */
    public static async updateContract(
      _id,
      { schedule, ...doc }: IContract & { schedule: any }
    ): Promise<IContractDocument | null> {
      const oldContract = await models.Contracts.getContract({
        _id
      });

      if (oldContract.contractTypeId !== doc.contractTypeId) {
        doc.number = await getNumber(models, doc.contractTypeId);
      }

      if (!doc.collateralsData) {
        doc.collateralsData = oldContract.collateralsData;
      }

      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.firstPayDate = getFullDate(doc.firstPayDate);
      doc.mustPayDate = getFullDate(doc.firstPayDate);
      doc.endDate =
        doc.endDate ?? addMonths(new Date(doc.startDate), doc.tenor);
      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
        doc.collateralsData || []
      );
      await models.Contracts.updateOne({ _id }, { $set: doc });
      const transactions = await models.Transactions.find({
        contractId: _id
      }).lean();
      if (
        doc.repayment === REPAYMENT.CUSTOM &&
        schedule.length > 0 &&
        transactions.length === 0
      ) {
        await models.FirstSchedules.deleteMany({ contractId: _id });
        await models.Schedules.deleteMany({ contractId: _id });

        const schedules = schedule.map((a) => {
          return {
            contractId: _id,
            status: SCHEDULE_STATUS.PENDING,
            payDate: getFullDate(a.payDate),
            balance: a.balance,
            interestNonce: a.interestNonce,
            payment: a.payment,
            total: a.interestNonce + a.payment
          };
        });

        await models.FirstSchedules.insertMany(schedules);
        await models.Schedules.insertMany(schedules);
      }

      const contract = await models.Contracts.findOne({ _id });
      return contract;
    }

    /**
     * Close Contract
     */
    public static async closeContract(subdomain, doc: ICloseVariable) {
      const contract = await models.Contracts.getContract({
        _id: doc.contractId
      });
      const closeInfo = await getCloseInfo(
        models,
        subdomain,
        contract,
        doc.closeDate
      );

      const trDoc: ITransaction = {
        contractId: doc.contractId,
        payDate: doc.closeDate,
        description: doc.description,
        currency: contract.currency,
        total: closeInfo.total
      };
      await models.Transactions.createTransaction(subdomain, trDoc);

      await models.Contracts.updateOne(
        { _id: doc.contractId },
        {
          $set: {
            closeDate: doc.closeDate,
            closeType: doc.closeType,
            closeDescription: doc.description,
            status: CONTRACT_STATUS.CLOSED
          }
        }
      );

      return models.Contracts.getContract({
        _id: doc.contractId
      });
    }

    /**
     * Remove Contract category
     */
    public static async removeContracts(_ids) {
      const transactions = await models.Transactions.countDocuments({
        contractId: _ids
      });
      if (transactions > 0) {
        throw new Error("You can not delete contract with transaction");
      }
      await models.Schedules.deleteMany({
        contractId: { $in: _ids }
      });

      return models.Contracts.deleteMany({ _id: { $in: _ids } });
    }

    public static async clientCreditLoanRequest(
      subdomain,
      requestParams: { contractId: string; amount: number; customerId: string },
      contract: IContractDocument
    ) {
      const config: IConfig = await getConfig("loansConfig", subdomain);
      const trDate = new Date();
      if (
        new BigNumber(contract.leaseAmount).toNumber() <=
        new BigNumber(contract.loanBalanceAmount)
          .plus(requestParams.amount)
          .dp(config.calculationFixed)
          .toNumber()
      ) {
        const loanTr = await models.Transactions.createTransaction(subdomain, {
          total: requestParams.amount,
          give: requestParams.amount,
          contractId: requestParams.contractId,
          customerId: requestParams.customerId,
          payDate: new Date(),
          currency: contract.currency
        });

        const savingTr = {
          contractId: contract.depositAccountId,
          customerId: requestParams.customerId,
          transactionType: "income",
          description: "credit loan give",
          payDate: trDate,
          payment: requestParams.amount,
          currency: contract.currency,
          total: requestParams.amount,
          dealtType: "external",
          dealtResponse: loanTr,
          accountNumber: contract.number,
          externalBankName: "loans"
        };

        await sendMessageBroker(
          {
            action: "transactions.createTransaction",
            subdomain,
            data: savingTr
          },
          "savings"
        );
      } else {
        throw new Error("Limit exceed!");
      }
      return contract;
    }
  }

  contractSchema.loadClass(Contract);
  return contractSchema;
};
