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
  IInsuranceType,
  IInsuranceTypeDocument
} from '../../../models/definitions/insuranceTypes';

const insuranceTypeMutations = {
  insuranceTypesAdd: async (
    _root,
    doc: IInsuranceType & { yearPercents: string | number[] },
    { user, models, subdomain }: IContext
  ) => {
    doc.yearPercents =
      typeof doc.yearPercents === 'string'
        ? doc.yearPercents.split(',').map(a => Number(a))
        : [];

    //TODO check this method
    const insuranceType = await models.InsuranceTypes.createInsuranceType(doc);

    const logData = {
      type: 'insuranceType',
      newData: doc,
      object: insuranceType,
      extraParams: { models }
    };

    const descriptions = gatherDescriptions(logData);

    await putCreateLog(
      subdomain,
      messageBroker,
      {
        ...logData,
        ...descriptions
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
    {
      _id,
      ...doc
    }: IInsuranceTypeDocument & { yearPercents: string | number[] },
    { models, user, subdomain }: IContext
  ) => {
    doc.yearPercents =
      typeof doc.yearPercents === 'string'
        ? doc.yearPercents.split(',').map(a => Number(a))
        : [];

    const insuranceType = await models.InsuranceTypes.getInsuranceType({
      _id
    });

    const updated = await models.InsuranceTypes.updateInsuranceType(_id, doc);

    const logData = {
      type: 'insuranceType',
      object: insuranceType,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    const descriptions = gatherDescriptions(logData);

    await putUpdateLog(
      subdomain,
      messageBroker,
      {
        ...logData,
        ...descriptions
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
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check
    const insuranceTypes = await models.InsuranceTypes.find({
      _id: { $in: insuranceTypeIds }
    }).lean();

    await models.InsuranceTypes.removeInsuranceTypes(insuranceTypeIds);

    for (const insuranceType of insuranceTypes) {
      let logData = {
        type: 'insuranceType',
        object: insuranceType,
        extraParams: { models }
      };

      const descriptions = gatherDescriptions(logData);
      await putDeleteLog(
        subdomain,
        messageBroker,
        {
          ...logData,
          ...descriptions
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
