import {
  CONTRACT_STATUS,
  LEASE_TYPES,
  REPAYMENT,
  SCHEDULE_STATUS,
} from "./definitions/constants";
import {
  contractSchema,
  ICloseVariable,
  IContract,
  IContractDocument,
  IInsurancesData,
  ICollateralData,
} from "./definitions/contracts";
import { getCloseInfo } from "./utils/closeUtils";
import {
  addMonths,
  calcInterest,
  getDiffDay,
  getFullDate,
  getNumber,
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

const contractValidations = (doc: IContract) => {
  if (doc.stepRules?.length) {
    let totalTenor = 0;
    for (const stepRule of doc.stepRules) {
      if (!stepRule.salvageAmount && !stepRule.totalMainAmount && !stepRule.mainPayPerMonth) {
        throw new Error('yadaj neg utga buglugdsun baih yostoi')
      }

      if (stepRule.salvageAmount || 0 > doc.leaseAmount) {
        throw new Error('uldeeh dun ni niit zeeliin dungees hetersen baina')
      }

      totalTenor += stepRule.tenor
    }

    if (totalTenor > doc.tenor) {
      throw new Error(' durmuudiin urgeljleh hugatsaa ni niit urgeljleh hugatsaanaas hetersen baina')
    }
  }
}

export interface IContractModel extends Model<IContractDocument> {
  getContract(
    selector: FilterQuery<IContractDocument>
  ): Promise<IContractDocument>;
  createContract(doc: IContract, subdomain: string): Promise<IContractDocument>;
  updateContract(_id, doc: IContract): Promise<IContractDocument>;
  closeContract(subdomain, doc: ICloseVariable);
  clientCreditLoanRequest(
    subdomain,
    requestParams: {
      contractId: string;
      amount: number;
      customerId: string;
      dealtType?: "own" | "external";
      dealtResponse?: any;
      accountNumber?: string;
      accountHolderName?: string;
      externalBankName?: string;
    },
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
      const contract = await models.Contracts.findOne(selector).lean();

      if (!contract) {
        throw new Error("Contract not found");
      }

      return contract;
    }

    /**
     * Create a contract
     */
    public static async createContract(
      { schedule, ...doc }: IContract & { schedule: any },
      subdomain: string
    ): Promise<IContractDocument> {
      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.firstPayDate = getFullDate(doc.firstPayDate);
      doc.endDate =
        doc.endDate ?? addMonths(new Date(doc.startDate), doc.tenor);
      if (!doc.useManualNumbering || !doc.number)
        doc.number = await getNumber(models, doc.contractTypeId);

      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
        doc.collateralsData || []
      );

      const contract = await models.Contracts.create(doc);

      if (
        doc.leaseType === LEASE_TYPES.LINEAR ||
        doc.leaseType === LEASE_TYPES.SAVING
      ) {
        if (!contract.savingContractId) {
          throw new Error("Saving contract not selected");
        }

        const diffDays = getDiffDay(doc.startDate, doc.endDate);

        const interest = calcInterest({
          balance: doc.leaseAmount,
          interestRate: doc.interestRate,
          dayOfMonth: diffDays,
        });

        const schedules = [
          {
            contractId: contract._id,
            status: SCHEDULE_STATUS.PENDING,
            payDate: doc.endDate,
            balance: doc.leaseAmount,
            interestNonce: interest,
            payment: doc.leaseAmount,
            total: doc.leaseAmount,
          },
        ];

        await sendMessageBroker(
          {
            action: "block.create",
            data: {
              customerId: contract.customerId,
              accountId: contract.savingContractId,
              description: "saving collateral loan",
              blockType: "scheduleTransaction",
              amount: contract.leaseAmount,
              scheduleDate: contract.endDate,
              payDate: contract.startDate,
            },
            isRPC: true,
            subdomain,
          },
          "savings"
        );

        await models.FirstSchedules.insertMany(schedules);
        await models.Schedules.insertMany(schedules);
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
        _id,
      });

      const transactions = await models.Transactions.find({
        contractId: _id,
      }).lean();

      if (transactions.length) {
        throw new Error('Not update, cause: has a transactions')
      }

      if (oldContract.contractTypeId !== doc.contractTypeId) {
        doc.number = await getNumber(models, doc.contractTypeId);
      }

      if (!doc.collateralsData) {
        doc.collateralsData = oldContract.collateralsData;
      }

      doc.startDate = getFullDate(doc.startDate || new Date());
      doc.firstPayDate = getFullDate(doc.firstPayDate);
      doc.endDate =
        doc.endDate ?? addMonths(new Date(doc.startDate), doc.tenor);
      doc.insuranceAmount = getInsurancAmount(
        doc.insurancesData || [],
        doc.collateralsData || []
      );
      await models.Contracts.updateOne({ _id }, { $set: doc });

      const contract = await models.Contracts.findOne({ _id });
      return contract;
    }

    /**
     * Close Contract
     */
    public static async closeContract(subdomain, doc: ICloseVariable) {
      const contract = await models.Contracts.getContract({
        _id: doc.contractId,
      });
      const closeInfo = await getCloseInfo(
        models,
        contract,
        doc.closeDate
      );

      const trDoc: ITransaction = {
        contractId: doc.contractId,
        payDate: doc.closeDate,
        description: doc.description,
        currency: contract.currency,
        total: closeInfo.total,
      };
      await models.Transactions.createTransaction(subdomain, trDoc);

      await models.Contracts.updateOne(
        { _id: doc.contractId },
        {
          $set: {
            closeDate: doc.closeDate,
            closeType: doc.closeType,
            closeDescription: doc.description,
            status: CONTRACT_STATUS.CLOSED,
          },
        }
      );

      return models.Contracts.getContract({
        _id: doc.contractId,
      });
    }

    /**
     * Remove Contract category
     */
    public static async removeContracts(_ids) {
      const transactions = await models.Transactions.countDocuments({
        contractId: _ids,
      });
      if (transactions > 0) {
        throw new Error("You can not delete contract with transaction");
      }
      await models.Schedules.deleteMany({
        contractId: { $in: _ids },
      });

      return models.Contracts.deleteMany({ _id: { $in: _ids } });
    }

    public static async clientCreditLoanRequest(
      subdomain,
      requestParams: {
        contractId: string;
        amount: number;
        customerId: string;
        dealtType?: "own" | "external";
        dealtResponse?: any;
        accountNumber?: string;
        accountHolderName?: string;
        externalBankName?: string;
      },
      contract: IContractDocument
    ) {
      const config: IConfig = await getConfig("loansConfig", subdomain);
      const trDate = new Date();
      if (
        new BigNumber(contract.leaseAmount).toNumber() >=
        // new BigNumber(contract.loanBalanceAmount)
        new BigNumber(0)
          .plus(requestParams.amount)
          .dp(config.calculationFixed)
          .toNumber()
      ) {
        const loanTr = await models.Transactions.createTransaction(subdomain, {
          total: requestParams.amount,
          give: requestParams.amount,
          contractId: requestParams.contractId,
          customerId: requestParams.customerId,
          transactionType: "give",
          payDate: new Date(),
          currency: contract.currency,
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
          externalBankName: "loans",
        };

        await sendMessageBroker(
          {
            action: "transactions.createTransaction",
            subdomain,
            data: savingTr,
          },
          "savings"
        );
        if (requestParams.dealtType == "external") {
          const savingTr = {
            contractId: contract.depositAccountId,
            customerId: requestParams.customerId,
            transactionType: "outcome",
            description: "credit loan give",
            payDate: trDate,
            payment: requestParams.amount,
            currency: contract.currency,
            total: requestParams.amount,
            dealtType: "external",
            dealtResponse: loanTr,
            accountNumber: requestParams.accountNumber,
            accountHolderName: requestParams.accountHolderName,
            externalBankName: requestParams.externalBankName,
          };

          await sendMessageBroker(
            {
              action: "transactions.createTransaction",
              subdomain,
              data: savingTr,
            },
            "savings"
          );
        }
      } else {
        throw new Error("Limit exceed!");
      }
      return contract;
    }
  }

  contractSchema.loadClass(Contract);
  return contractSchema;
};
