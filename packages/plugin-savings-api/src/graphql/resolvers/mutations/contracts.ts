import {
  IContract,
  IContractDocument
} from '../../../models/definitions/contracts';
import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

import { createLog, deleteLog, updateLog } from '../../../logUtils';

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
