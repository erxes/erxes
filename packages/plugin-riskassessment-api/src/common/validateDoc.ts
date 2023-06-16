import { IModels } from '../connectionResolver';

export const validatePlan = async ({
  models,
  doc
}: {
  models: IModels;
  doc: any;
}) => {
  if (!doc.structureType) {
    throw new Error('Please specify a structure type');
  }

  if (!doc.configs) {
    throw new Error('No parameters specified for the plan');
  }
  const requiredConfigs = ['cardType', 'boardId', 'pipelineId', 'stageId'];

  if (!requiredConfigs.every(item => doc.configs.hasOwnProperty(item))) {
    throw new Error('Please fill in the required configuration for the plan');
  }
};
