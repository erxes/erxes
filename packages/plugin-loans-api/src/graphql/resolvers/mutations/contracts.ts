import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import {
  ICollateralData,
  IContract,
  IContractDocument
} from "../../../models/definitions/contracts";
import { checkPermission } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";
import {
  getConfig,
  getFieldObject,
  sendSalesMessage,
  sendCoreMessage,
  sendMessageBroker
} from "../../../messageBroker";
import { createLog, deleteLog, updateLog } from "../../../logUtils";
import { putActivityLog } from "@erxes/api-utils/src/logUtils";

export const loansContractChanged = async (contract: IContractDocument) => {
  graphqlPubsub.publish(
    'loansContractChanged',
    {
      loansContractChanged: {
        ...contract
      },
    },
  );
};

const contractMutations = {
  contractsAdd: async (
    _root,
    doc: IContract,
    { user, models, subdomain }: IContext
  ) => {
    const contract = await models.Contracts.createContract(doc, subdomain);

    const logData = {
      type: "contract",
      newData: doc,
      object: contract,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return contract;
  },

  clientLoanContractsAdd: async (
    _root,
    doc: IContract & { secondaryPassword: string },
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

    const contract = await models.Contracts.createContract(doc, subdomain);

    const logData = {
      type: "contract",
      newData: doc,
      object: contract,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return contract;
  },

  /**
   * Updates a contract
   */

  contractsEdit: async (
    _root,
    { _id, ...doc }: IContractDocument,
    { models, user, subdomain }: IContext
  ) => {
    const contract = await models.Contracts.getContract({ _id });
    const updated = await models.Contracts.updateContract(_id, doc);

    const logData = {
      type: "contract",
      object: contract,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);
    // action:'edit',data: { ...logData, coc: contract,contentType: `loans:${logData.type}` }}
    await putActivityLog(subdomain, {
      action: "putActivityLog",
      data: {
        ...logData,
        createdBy: user._id,
        coc: contract,
        contentType: `loans:${logData.type}`,
        contentId: contract._id
      }
    });

    await loansContractChanged(updated);
    return updated;
  },

  contractsDealEdit: async (
    _root,
    params: { _id: string, dealId: string },
    { models, user, subdomain }: IContext
  ) => {
    const { _id, dealId } = params;
    const contract = await models.Contracts.getContract({ _id });

    if (!dealId && contract.dealId) {
      delete contract.dealId;
      await models.Contracts.updateOne({ _id }, { $unset: { dealId: '' } });
      return;
    }

    contract.dealId = dealId;
    await models.Contracts.updateOne({ _id }, { $set: { dealId } });
    await models.Contracts.updateMany(
      { dealId, _id: { $ne: _id } },
      { $unset: { dealId: '' } }
    );

    const logData = {
      type: "contract",
      object: contract,
      newData: { dealId },
      updatedDocument: { ...contract, dealId },
      extraParams: { models }
    };
    await loansContractChanged(contract);
    return contract;
  },

  /**
   * to close contract
   */

  contractsClose: async (_root, doc, { models, user, subdomain }: IContext) => {
    const contract = await models.Contracts.getContract({
      _id: doc.contractId
    });
    const updated = await models.Contracts.closeContract(subdomain, doc);

    const logData = {
      type: "contract",
      object: contract,
      newData: doc,
      updatedDocument: updated,
      extraParams: { models }
    };

    await loansContractChanged(updated);
    await updateLog(subdomain, user, logData);

    return updated;
  },

  /**
   * Removes contracts
   */

  contractsRemove: async (
    _root,
    { contractIds }: { contractIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const contracts = await models.Contracts.find({
      _id: { $in: contractIds }
    }).lean();

    await models.Contracts.removeContracts(contractIds);

    for (const contract of contracts) {
      const logData = {
        type: "contract",
        object: contract,
        extraParams: { models }
      };

      await deleteLog(subdomain, user, logData);
    }

    return contractIds;
  },

  /**
   * from deal productsData
   */

  getProductsData: async (
    _root,
    { contractId }: { contractId: string },
    { models, subdomain }: IContext
  ) => {
    const contract = await models.Contracts.getContract({
      _id: contractId
    });

    const dealIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "contract",
        relTypes: ["deal"],
        mainTypeId: contract._id
      },
      isRPC: true
    });

    if (!dealIds) {
      return contract;
    }

    const deals = await sendSalesMessage({
      subdomain,
      action: "deals.find",
      data: { _id: { $in: dealIds } },
      isRPC: true
    });

    const oldCollateralIds = (contract.collateralsData || []).map(
      item => item.collateralId
    );

    const collateralsData: ICollateralData[] = contract.collateralsData || [];

    for (const deal of deals) {
      for (const data of deal.productsData) {
        if (oldCollateralIds.includes(data.productId)) continue;

        for (let i = 0; i < data.quantity; i++) {
          collateralsData.push({
            collateralId: data.productId,
            cost: data.unitPrice,
            collateralTypeId: data.collateralTypeId,
            percent: 100,
            marginAmount: 0,
            leaseAmount: 0
          });
        }
      }
    }

    const collaterals: any = [];

    for (const data of collateralsData || []) {
      const collateral = await sendMessageBroker(
        {
          subdomain,
          action: "products.findOne",
          data: { _id: data.collateralId },
          isRPC: true
        },
        "core"
      );

      const insuranceType = await models.InsuranceTypes.findOne({
        _id: data.insuranceTypeId
      });

      collaterals.push({
        ...data,
        collateral,
        insuranceType
      });
    }

    // return collaterals;

    return { collateralsData: collaterals };
  },

  stopInterest: async (
    _root,
    {
      contractId,
      stoppedDate,
      isStopLoss,
      interestAmount,
      lossAmount
    }: {
      contractId: string;
      stoppedDate: Date;
      isStopLoss: boolean;
      interestAmount: number;
      lossAmount: number;
    },
    { models }: IContext
  ) => {

    const result = await models.InterestCorrection.stopInterest({
      contractId,
      stoppedDate,
      interestAmount,
      isStopLoss,
      lossAmount
    });
    const updated = await models.Contracts.getContract({ _id: contractId });
    await loansContractChanged(updated);
    return result
  },

  interestChange: async (
    _root,
    {
      contractId,
      stoppedDate,
      interestAmount,
      lossAmount
    }: {
      contractId: string;
      stoppedDate: Date;
      isStopLoss: boolean;
      interestAmount: number;
      lossAmount: number;
    },
    { models }: IContext
  ) => {
    const result = await models.InterestCorrection.interestChange({
      contractId,
      stoppedDate,
      interestAmount,
      lossAmount
    });
    const updated = await models.Contracts.getContract({ _id: contractId });
    await loansContractChanged(updated);
    return result
  },

  interestReturn: async (
    _root,
    {
      contractId,
      invDate,
      interestAmount
    }: {
      contractId: string;
      invDate: Date;
      interestAmount: number;
    },
    { models }: IContext
  ) => {
    const result = await models.InterestCorrection.interestReturn({
      contractId,
      invDate,
      interestAmount
    });
    const updated = await models.Contracts.getContract({ _id: contractId });
    await loansContractChanged(updated);
    return result
  },

  clientCreditLoanRequest: async (
    _root,
    {
      secondaryPassword,
      customerId,
      amount,
      contractId,
      dealtType,
      dealtResponse,
      accountNumber,
      accountHolderName,
      externalBankName
    }: {
      contractId: string;
      amount: number;
      customerId: string;
      secondaryPassword: string;
      dealtType?: "own" | "external";
      dealtResponse?: any;
      accountNumber?: string;
      accountHolderName?: string;
      externalBankName?: string;
    },
    { models, subdomain }: IContext
  ) => {
    const validate = await sendMessageBroker(
      {
        subdomain,
        action: "clientPortalUsers.validatePassword",
        data: {
          userId: customerId,
          password: secondaryPassword,
          secondary: true
        }
      },
      "clientportal"
    );

    if (validate?.status === "error") {
      throw new Error(validate.errorMessage);
    }

    const contract = await models.Contracts.getContract({ _id: contractId });

    if (!contract) {
      throw new Error("Contract not found!");
    }

    return await models.Contracts.clientCreditLoanRequest(
      subdomain,
      {
        customerId,
        amount,
        contractId,
        dealtType,
        dealtResponse,
        accountNumber,
        accountHolderName,
        externalBankName
      },
      contract
    );
  },

  clientCreditLoanCalculate: async (
    _root,
    {
      customerId
    }: {
      customerId: string;
    },
    { subdomain }: IContext
  ) => {
    let customerCreditAmount = 0;

    const customer = await sendMessageBroker(
      {
        subdomain,
        action: "customers.findOne",
        data: { _id: customerId },
        isRPC: true
      },
      "core"
    );

    const customerScore = await sendMessageBroker(
      { subdomain, action: "getScoring", data: { customerId }, isRPC: true },
      "burenscoring"
    );

    const configs = await getConfig("creditScore", subdomain);

    if (!configs) {
      throw new Error("Credit score config not configured!");
    }

    for (let key in configs) {
      const config = configs[key];

      if (
        config.startScore <= customerScore.score &&
        config.endScore >= customerScore.score
      ) {
        customerCreditAmount = config.amount;
        break;
      }
    }

    const maxLeaseAmountField = await getFieldObject(
      subdomain,
      "core:customer",
      "maxLeaseAmount"
    );

    if (customerCreditAmount > 0 && maxLeaseAmountField) {
      const index =
        customer.customFieldsData?.findIndex(
          a => a.field == maxLeaseAmountField._id
        ) || -1;
      if (index == -1) {
        customer.customFieldsData = [
          ...customer.customFieldsData,
          {
            field: maxLeaseAmountField._id,
            value: customerCreditAmount.toString(),
            stringValue: customerCreditAmount.toString(),
            numberValue: customerCreditAmount,
            text: maxLeaseAmountField.code
          }
        ];
      } else {
        customer.customFieldsData[index] = {
          field: maxLeaseAmountField._id,
          value: customerCreditAmount.toString(),
          stringValue: customerCreditAmount.toString(),
          numberValue: customerCreditAmount,
          text: maxLeaseAmountField.code
        };
      }

      await sendMessageBroker(
        {
          subdomain,
          action: "customers.updateOne",
          data: {
            selector: { _id: customerId },
            modifier: { $set: customer }
          },
          isRPC: true
        },
        "core"
      );
    }

    return customerCreditAmount;
  }
};

checkPermission(contractMutations, "contractsAdd", "contractsAdd");
checkPermission(contractMutations, "contractsEdit", "contractsEdit");
checkPermission(contractMutations, "contractsDealEdit", "contractsDealEdit");
checkPermission(contractMutations, "contractsClose", "contractsClose");
checkPermission(contractMutations, "contractsRemove", "contractsRemove");

export default contractMutations;
