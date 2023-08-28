import {
  ICollateralData,
  IContract,
  IContractDocument
} from '../../../models/definitions/contracts';
import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendMessageBroker
} from '../../../messageBroker';
import { createLog, deleteLog, updateLog } from '../../../logUtils';

const contractMutations = {
  contractsAdd: async (
    _root,
    doc: IContract,
    { user, models, subdomain }: IContext
  ) => {
    const contract = await models.Contracts.createContract(doc);

    const logData = {
      type: 'contract',
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
      type: 'contract',
      object: contract,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
  },
  contractsDealEdit: async (
    _root,
    { _id, ...doc }: IContractDocument,
    { models, user, subdomain }: IContext
  ) => {
    const checkOtherDeals = await models.Contracts.countDocuments({
      dealId: doc.dealId,
      _id: { $ne: _id }
    });

    if (!!checkOtherDeals) {
      await models.Contracts.updateMany(
        { dealId: doc.dealId, _id: { $ne: _id } },
        { $set: { dealId: undefined } }
      );
    }

    const contract = await models.Contracts.getContract({ _id });
    const updated = await models.Contracts.updateContract(_id, doc);

    const logData = {
      type: 'contract',
      object: contract,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
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
      type: 'contract',
      object: contract,
      newData: doc,
      updatedDocument: updated,
      extraParams: { models }
    };

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
        type: 'contract',
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
      action: 'conformities.savedConformity',
      data: {
        mainType: 'contract',
        relTypes: ['deal'],
        mainTypeId: contract._id
      },
      isRPC: true
    });

    if (!dealIds) {
      return contract;
    }

    const deals = await sendCardsMessage({
      subdomain,
      action: 'deals.find',
      data: { _id: { $in: dealIds } },
      isRPC: true
    });

    const oldCollateralIds = contract.collateralsData.map(
      item => item.collateralId
    );

    const collateralsData: ICollateralData[] = contract.collateralsData;

    for (const deal of deals) {
      for (const data of deal.productsData) {
        if (oldCollateralIds.includes(data.productId)) continue;

        for (let i = 0; i < data.quantity; i++) {
          collateralsData.push({
            collateralId: data.productId,
            cost: data.unitPrice,
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
          action: 'findOne',
          data: { _id: data.collateralId },
          isRPC: true
        },
        'products'
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
  }
};

checkPermission(contractMutations, 'contractsAdd', 'contractsAdd');
checkPermission(contractMutations, 'contractsEdit', 'contractsEdit');
checkPermission(contractMutations, 'contractsDealEdit', 'contractsDealEdit');
checkPermission(contractMutations, 'contractsClose', 'contractsClose');
checkPermission(contractMutations, 'contractsRemove', 'contractsRemove');

export default contractMutations;
