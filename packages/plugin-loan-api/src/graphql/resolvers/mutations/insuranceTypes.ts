import { putCreateLog, putDeleteLog, putUpdateLog } from 'erxes-api-utils';
import { gatherDescriptions } from '../../../utils';
import { checkPermission } from '@erxes/api-utils/src';

const insuranceTypeMutations = {
  insuranceTypesAdd: async (
    _root,
    doc,
    { user, docModifier, models, checkPermission, messageBroker }
  ) => {
    doc.yearPercents = doc.yearPercents.split(', ');
    const insuranceType = models.InsuranceTypes.createInsuranceType(
      models,
      docModifier(doc),
      user
    );

    await putCreateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'insuranceType',
        newData: doc,
        object: insuranceType,
        extraParams: { models }
      },
      user
    );

    return insuranceType;
  },
  /**
   * Updates a insuranceType
   */

  insuranceTypesEdit: async (
    _root,
    { _id, ...doc },
    { models, checkPermission, user, messageBroker }
  ) => {
    doc.yearPercents = doc.yearPercents.split(', ');
    const insuranceType = await models.InsuranceTypes.getInsuranceType(models, {
      _id
    });
    const updated = await models.InsuranceTypes.updateInsuranceType(
      models,
      _id,
      doc
    );

    await putUpdateLog(
      messageBroker,
      gatherDescriptions,
      {
        type: 'insuranceType',
        object: insuranceType,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models }
      },
      user
    );

    return updated;
  },

  /**
   * Removes insuranceTypes
   */
  insuranceTypesRemove: async (
    _root,
    { insuranceTypeIds }: { insuranceTypeIds: string[] },
    { models, checkPermission, user, messageBroker }
  ) => {
    // TODO: contracts check
    const insuranceTypes = await models.InsuranceTypes.find({
      _id: { $in: insuranceTypeIds }
    }).lean();

    await models.InsuranceTypes.removeInsuranceTypes(models, insuranceTypeIds);

    for (const insuranceType of insuranceTypes) {
      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'insuranceType',
          object: insuranceType,
          extraParams: { models }
        },
        user
      );
    }

    return insuranceTypeIds;
  }
};
checkPermission(
  insuranceTypeMutations,
  'insuranceTypesAdd',
  'manageInsuranceTypes'
);
checkPermission(
  insuranceTypeMutations,
  'insuranceTypesEdit',
  'manageInsuranceTypes'
);
checkPermission(
  insuranceTypeMutations,
  'insuranceTypesRemove',
  'manageInsuranceTypes'
);

export default insuranceTypeMutations;
