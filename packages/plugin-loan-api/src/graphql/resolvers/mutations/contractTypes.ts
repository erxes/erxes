import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import { gatherDescriptions } from '../../../utils';
import { checkPermission } from '@erxes/api-utils/src';

const contractTypeMutations = {
  contractTypesAdd: async (
    _root,
    doc,
    { user, docModifier, models, checkPermission, messageBroker }
  ) => {
    const contractType = models.ContractTypes.createContractType(
      models,
      docModifier(doc),
      user
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'contractType',
        newData: doc,
        object: contractType,
        extraParams: { models }
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
    { _id, ...doc },
    { models, checkPermission, user, messageBroker }
  ) => {
    const contractType = await models.ContractTypes.getContractType(models, {
      _id
    });
    const updated = await models.ContractTypes.updateContractType(
      models,
      _id,
      doc
    );

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'contractType',
        object: contractType,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
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
    { models, checkPermission, user, messageBroker }
  ) => {
    // TODO: contracts check
    const contractTypes = await models.ContractTypes.find({
      _id: { $in: contractTypeIds }
    }).lean();

    await models.ContractTypes.removeContractTypes(models, contractTypeIds);

    for (const contractType of contractTypes) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        { type: 'contractType', object: contractType, extraParams: { models } },
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
