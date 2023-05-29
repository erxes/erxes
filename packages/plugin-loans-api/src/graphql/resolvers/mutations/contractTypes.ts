import { gatherDescriptions } from '../../../utils';
import {
  checkPermission,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import messageBroker from '../../../messageBroker';
import {
  IContractType,
  IContractTypeDocument
} from '../../../models/definitions/contractTypes';

const contractTypeMutations = {
  contractTypesAdd: async (
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

    const descriptions = await gatherDescriptions(logData);

    await putCreateLog(
      subdomain,
      messageBroker(),
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return contractType;
  },
  /**
   * Updates a contractType
   */

  contractTypesEdit: async (
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

    const descriptions = await gatherDescriptions(logData);

    await putUpdateLog(
      subdomain,
      messageBroker(),
      {
        ...logData,
        ...descriptions
      },
      user
    );

    return updated;
  },

  /**
   * Removes contractTypes
   */

  contractTypesRemove: async (
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
      const descriptions = await gatherDescriptions({
        type: 'contractType',
        object: contractType,
        extraParams: { models }
      });
      await putDeleteLog(
        subdomain,
        messageBroker(),
        {
          type: 'contractType',
          object: contractType,
          extraParams: { models },
          ...descriptions
        },
        user
      );
    }

    return contractTypeIds;
  }
};

checkPermission(contractTypeMutations, 'contractTypesAdd', 'manageContracts');
checkPermission(contractTypeMutations, 'contractTypesEdit', 'manageContracts');
checkPermission(
  contractTypeMutations,
  'contractTypesRemove',
  'manageContracts'
);

export default contractTypeMutations;
