import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import {
  IContractType,
  IContractTypeDocument
} from '../../../models/definitions/contractTypes';
import { createLog, deleteLog, updateLog } from '../../../logUtils';

const contractTypeMutations = {
  savingsContractTypesAdd: async (
    _root,
    doc: IContractType,
    { user, models, subdomain }: IContext
  ) => {
    const contractType = await models.ContractTypes.createContractType(doc);

    const logData = {
      type: 'contractType',
      newData: doc,
      object: contractType,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return contractType;
  },
  /**
   * Updates a contractType
   */

  savingsContractTypesEdit: async (
    _root,
    { _id, ...doc }: IContractTypeDocument,
    { models, user, subdomain }: IContext
  ) => {
    const contractType = await models.ContractTypes.getContractType({
      _id
    });
    const updated = await models.ContractTypes.updateContractType(_id, doc);

    const logData = {
      type: 'contractType',
      newData: doc,
      object: contractType,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
  },

  /**
   * Removes contractTypes
   */

  savingsContractTypesRemove: async (
    _root,
    { contractTypeIds }: { contractTypeIds: string[] },
    { models, subdomain, user }: IContext
  ) => {
    // TODO: contracts check
    const contractTypes = await models.ContractTypes.find({
      _id: { $in: contractTypeIds }
    }).lean();

    await models.ContractTypes.removeContractTypes(contractTypeIds);

    for (const contractType of contractTypes) {
      const logData = {
        type: 'contractType',
        object: contractType,
        extraParams: { models }
      };
      await deleteLog(subdomain, user, logData);
    }

    return contractTypeIds;
  }
};

// checkPermission(contractTypeMutations, 'contractTypesAdd', 'manageContracts');
// checkPermission(contractTypeMutations, 'contractTypesEdit', 'manageContracts');
// checkPermission(
//   contractTypeMutations,
//   'contractTypesRemove',
//   'manageContracts'
// );

export default contractTypeMutations;
