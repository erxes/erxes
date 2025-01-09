import { IModels } from "../../connectionResolver";
import { IConfig } from "../../interfaces/config";
import { getConfig, sendMessageBroker } from "../../messageBroker";
import { TRANSACTION_TYPE } from "../definitions/constants";
import {
  ITransaction,
  ITransactionDocument
} from "../definitions/transactions";

export async function checkTransactionValidation(periodLock, doc, subdomain) {
  if (periodLock && !periodLock?.excludeContracts.includes(doc.contractId)) {
    throw new Error(
      "At this moment transaction can not been created because this date closed"
    );
  }
  if (doc.transactionType === TRANSACTION_TYPE.OUTCOME && subdomain) {
    const config: IConfig = await getConfig("savingConfig", subdomain);
    if (!config.oneTimeTransactionLimit) {
      throw new Error("oneTimeTransactionLimit not configured");
    }
    if (config.oneTimeTransactionLimit < doc.total) {
      throw new Error("One Time Transaction Limit not configured");
    }
  }
}

export const transactionDealt = async (
  doc: ITransaction,
  models: IModels,
  subdomain
) => {
  if (doc?.dealtType === "internal") {
    const contract = await models.Contracts.findOne({
      number: doc?.accountNumber
    }).lean();

    if (!contract) {
      throw new Error("Dealt contract not found");
    }

    doc.contractId = contract._id;
    doc.customerId = contract.customerId;
    doc.accountHolderName = doc.accountNumber = contract.number;
    doc.transactionType = TRANSACTION_TYPE.INCOME;
    doc.balance = contract.savingAmount;

    return await models.Transactions.createTransaction(doc, subdomain);
  } else if (doc?.dealtType === "external") {
    return await externalTransaction(doc, subdomain);
  }
  return null;
};

const externalTransaction = async (doc: ITransaction, subdomain: string) => {
  const config = await getConfig("savingConfig", subdomain);

  let response: any = null;

  switch (doc.externalBankName) {
    case "loans":
      response = await loanTransaction(doc, subdomain);
      break;
    case "050000":
      response = await sendMessageBroker(
        {
          action: "domesticTransfer",
          data: {
            configId: config.transactionConfigId,
            transferParams: {
              fromAccount: doc.ownBankNumber,
              toAccount: doc.accountNumber,
              amount: doc.total,
              description: doc.description,
              currency: doc.currency,
              loginName: config.transactionLoginName,
              password: config.transactionPassword,
              transferid: ""
            }
          },
          subdomain,
          isRPC: true
        },
        "khanbank"
      );

      break;
    default:
      response = await sendMessageBroker(
        {
          action: "interbankTransfer",
          subdomain,
          data: {
            configId: config.transactionConfigId,
            toCurrency: doc.currency,
            toAccountName: doc.accountHolderName,
            toBank: doc.accountNumber,
            transferParams: {
              fromAccount: doc.ownBankNumber,
              toAccount: doc.accountNumber,
              amount: doc.total,
              description: doc.description,
              currency: doc.currency,
              loginName: config.transactionLoginName,
              password: config.transactionPassword,
              transferid: ""
            }
          }
        },
        "khanbank"
      );

      break;
  }

  return response;
};

const loanTransaction = async (doc: ITransaction, subdomain: string) => {
  const repayment = {
    contractId: "FExx8N7XvdGe9BYHeJkDw",
    transactionType: "repayment",
    payDate: doc.payDate,
    total: doc.total
  };

  return await sendMessageBroker(
    { action: "transaction.add", subdomain, data: repayment, isRPC: true },
    "loans"
  );
};

export const removeTrAfterSchedule = async (
  models: IModels,
  tr: ITransactionDocument
) => {
  const nextTrsCount = await models.Transactions.countDocuments({
    contractId: tr.contractId,
    payDate: { $gt: tr.payDate }
  }).lean();

  if (nextTrsCount > 0) {
    throw new Error(
      "this transaction is not last transaction. Please This contracts last transaction only to change or remove"
    );
  }

  if (tr.contractReaction) {
    const { _id, ...otherData } = tr.contractReaction;
    await models.Contracts.updateOne({ _id: _id }, { $set: otherData });
  }
};
