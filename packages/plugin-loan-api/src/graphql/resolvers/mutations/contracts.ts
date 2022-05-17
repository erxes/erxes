import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import {
  ICollateralData,
  IContractDocument
} from '../../../models/definitions/contracts';
import { gatherDescriptions } from '../../../utils';
import { ConfirmBase } from '../../../models/utils/confirmContractUtils';
import { checkPermission } from '@erxes/api-utils/src';

const contractMutations = {
  contractsAdd: async (
    _root,
    doc,
    { user, docModifier, models, messageBroker }
  ) => {
    const contract = models.LoanContracts.createContract(
      models,
      docModifier(doc),
      user
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'contract',
        newData: doc,
        object: contract,
        extraParams: { models }
      },
      user
    );

    return contract;
  },

  /**
   * Updates a contract
   */

  contractsEdit: async (
    _root,
    { _id, ...doc },
    { models, user, messageBroker }
  ) => {
    const contract = await models.LoanContracts.getContract(models, { _id });
    const updated = await models.LoanContracts.updateContract(models, _id, doc);

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'contract',
        object: contract,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
      },
      user
    );

    return updated;
  },

  /**
   * to close contract
   */

  contractsClose: async (
    _root,
    { ...doc },
    { models, user, messageBroker, memoryStorage }
  ) => {
    const contract = await models.LoanContracts.getContract(models, {
      _id: doc.contractId
    });
    const updated = await models.LoanContracts.closeContract(
      models,
      messageBroker,
      memoryStorage,
      doc
    );

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'contract',
        object: contract,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
      },
      user
    );

    return updated;
  },

  /**
   * Removes contracts
   */

  contractsRemove: async (
    _root,
    { contractIds }: { contractIds: string[] },
    { models, user, messageBroker }
  ) => {
    const contracts = await models.LoanContracts.find({
      _id: { $in: contractIds }
    }).lean();

    await models.LoanContracts.removeContracts(models, contractIds);

    for (const contract of contracts) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'contract', object: contract, extraParams: { models } },
        user
      );
    }

    return contractIds;
  },

  /**
   * from deal productsData
   */

  getProductsData: async (
    _root,
    { contractId }: { contractId: string },
    { models, user }
  ) => {
    const contract = await models.LoanContracts.getContract(models, {
      _id: contractId
    });

    const dealIds = await models.Conformities.savedConformity({
      mainType: 'contract',
      relTypes: ['deal'],
      mainTypeId: contract._id
    });
    if (!dealIds) {
      return contract;
    }

    const deals = await models.Deals.find({ _id: { $in: dealIds } }).lean();
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
      const collateral = await models.Products.findOne({
        _id: data.collateralId
      });
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

  /**
   * Confirm lending of contracts
   */

  contractConfirm: async (
    _root,
    { contractId }: { contractId: string },
    { models, checkPermission, user, messageBroker, memoryStorage }
  ) => {
    const contract: IContractDocument = await models.LoanContracts.getContract(
      models,
      { _id: contractId }
    );

    if (!contract.number) {
      throw new Error('Number is required');
    }

    const schedules = await models.RepaymentSchedules.find({
      contractId
    }).lean();
    if (!schedules || !schedules.length) {
      throw new Error('Schedules are undefined');
    }

    return {
      result: await ConfirmBase(models, messageBroker, memoryStorage, contract)
    };
  }
};

checkPermission(contractMutations, 'contractsAdd', 'manageContracts');
checkPermission(contractMutations, 'contractsEdit', 'manageContracts');
checkPermission(contractMutations, 'contractsClose', 'manageContracts');
checkPermission(contractMutations, 'contractsRemove', 'manageContracts');
checkPermission(contractMutations, 'getProductsData', 'manageContracts');
checkPermission(contractMutations, 'contractConfirm', 'manageContracts');

export default contractMutations;
