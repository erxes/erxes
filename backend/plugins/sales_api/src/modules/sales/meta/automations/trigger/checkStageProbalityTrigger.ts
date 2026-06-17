import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';

type EventFieldChange = {
  prev?: unknown;
  current?: unknown;
};

type EventUpdateDescription = {
  updated?: Record<string, EventFieldChange>;
};

export const checkTriggerDealStageProbality = async ({
  models,
  target,
  config,
  eventUpdateDescription,
}: {
  models: IModels;
  target: IDeal;
  config: any;
  eventUpdateDescription?: EventUpdateDescription;
}) => {
  const { boardId, pipelineId, stageId, probability } = config || {};

  if (!probability) {
    return false;
  }

  const stageChange = eventUpdateDescription?.updated?.stageId;
  if (eventUpdateDescription) {
    if (!stageChange || stageChange.prev === stageChange.current) {
      return false;
    }
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
