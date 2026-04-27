import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';

export const checkTriggerDealStageProbality = async ({
  models,
  target,
  config,
}: {
  models: IModels;
  target: IDeal;
  config: any;
}) => {
  const { boardId, pipelineId, stageId, probability } = config || {};

  if (!probability) {
    return false;
  }

  const filter = { _id: target?.stageId, probability };
  if (stageId && stageId !== target.stageId) {
    return false;
  }

  if (!stageId && pipelineId) {
    const stageIds = await models.Stages.find({
      pipelineId,
      probability,
    }).distinct('_id');

    if (!stageIds.find((stageId) => target.stageId === stageId)) {
      return false;
    }
  }

  if (!stageId && !pipelineId && boardId) {
    const pipelineIds = await models.Pipelines.find({ boardId }).distinct(
      '_id',
    );

    const stageIds = await models.Stages.find({
      pipelineId: { $in: pipelineIds },
      probability,
    }).distinct('_id');

    if (!stageIds.find((stageId) => target.stageId === stageId)) {
      return false;
    }
  }

  return !!(await models.Stages.findOne(filter));
};
