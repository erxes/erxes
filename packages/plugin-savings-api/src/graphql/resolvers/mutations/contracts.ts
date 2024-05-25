import {
  IContract,
  IContractDocument
} from '../../../models/definitions/contracts';
import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

import { createLog, deleteLog, updateLog } from '../../../logUtils';
import { TRANSACTION_TYPE } from '../../../models/definitions/constants';
import { sendMessageBroker } from '../../../messageBroker';

const contractMutations = {
  savingsContractsAdd: async (
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
  clientSavingsContractsAdd: async (
    _root,
    doc: IContract,
    { user, models, subdomain }: IContext
  ) => {
    let savingAmount = doc.savingAmount;
    if (!doc.depositAccount) {
      throw new Error('No deposit account linked. Please select a deposit account to proceed with your savings.');
    }
    
    doc.savingAmount = 0;
    const contract = await models.Contracts.createContract(doc);

    const customer = await sendMessageBroker(
      {
        action: 'customers.findOne',
        subdomain,
        data: {
          _id: doc.customerId
        },
        isRPC: true
      },
      'contacts'
    );

    if (savingAmount > 0 && contract) {
      const deposit = await models.Contracts.findOne({
        _id: doc.depositAccount
      }).lean();

      if(!deposit) {
        throw new Error(`Contract ${doc.depositAccount} not found`);
      }

      await models.Transactions.createTransaction({
        payDate: doc.startDate,
        total: savingAmount,
        transactionType: TRANSACTION_TYPE.OUTCOME,
        contractId: deposit._id,
        customerId: doc.customerId,
        description: 'saving',
        payment: savingAmount,
        accountNumber: contract.number,
        accountHolderName: customer.firstName
      });

      await models.Transactions.createTransaction({
        payDate: doc.startDate,
        total: savingAmount,
        transactionType: TRANSACTION_TYPE.INCOME,
        contractId: contract._id,
        customerId: doc.customerId,
        description: 'saving',
        payment: savingAmount,
        accountNumber: deposit.number,
        accountHolderName: customer.firstName
      });
    }

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

  savingsContractsEdit: async (
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
  savingsContractsDealEdit: async (
    _root,
    { _id, ...doc }: IContractDocument,
    { models, user, subdomain }: IContext
  ) => {
    const checkOtherDeals = await models.Contracts.countDocuments({
      dealId: doc.dealId,
      _id: { $ne: _id }
    });

    if (checkOtherDeals) {
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

  savingsContractsClose: async (
    _root,
    doc,
    { models, user, subdomain }: IContext
  ) => {
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

  savingsContractsRemove: async (
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
  savingsExpandDuration: async (
    _root,
    { _id, contractTypeId }: { _id: string; contractTypeId: string },
    { models }: IContext
  ) => {
    const contract = await models.Contracts.expandDuration(_id, contractTypeId);

    return contract;
  },
  savingsInterestChange: async (
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
    const updatedContract = await models.Contracts.interestChange({
      contractId,
      stoppedDate,
      interestAmount,
      lossAmount
    });

    return updatedContract;
  },
  savingsInterestReturn: async (
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
    const updatedContract = await models.Contracts.interestReturn({
      contractId,
      invDate,
      interestAmount
    });
    return updatedContract;
  }
};

checkPermission(contractMutations, 'saingsContractsAdd', 'saingsContractsAdd');
checkPermission(
  contractMutations,
  'saingsContractsEdit',
  'saingsContractsEdit'
);
checkPermission(
  contractMutations,
  'saingsContractsDealEdit',
  'saingsContractsDealEdit'
);
checkPermission(
  contractMutations,
  'saingsContractsClose',
  'saingsContractsClose'
);
checkPermission(
  contractMutations,
  'saingsContractsRemove',
  'saingsContractsRemove'
);

export default contractMutations;
