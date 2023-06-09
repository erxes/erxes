import { IModels } from '../connectionResolver';

export const validatePlan = async ({
  models,
  doc
}: {
  models: IModels;
  doc: any;
}) => {
  if (doc.structureType || doc.structureTypeId) {
    throw new Error('Please specify a structure type');
  }
  if (doc.indicatorId && doc.groupId) {
    throw new Error('Please specify a indicator or group');
  }

  if (doc.params) {
    throw new Error('No parameters specified for the plan');
  }

  if (
    await models.Plan.findOne({
      structureType: doc.structureType,
      structureTypeId: doc.structureTypeId
    })
  ) {
    throw new Error('plan already exists');
  }
};
