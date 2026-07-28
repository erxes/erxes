import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';

type StageChangedTriggerConfig = {
  fromStageId?: string;
  toStageId?: string;
  pipelineId?: string;
  boardId?: string;
};

type EventFieldChange = {
  prev?: unknown;
  current?: unknown;
};

type EventUpdateDescription = {
  updated?: Record<string, EventFieldChange>;
};

export const checkTriggerDealStageChanged = async ({
  models,
  config,
  eventUpdateDescription,
}: {
  models: IModels;
  target: IDeal;
  config: StageChangedTriggerConfig;
  eventUpdateDescription?: EventUpdateDescription;
}) => {
  const { fromStageId, toStageId, pipelineId, boardId } = config || {};
  const stageChange = eventUpdateDescription?.updated?.stageId;

  if (!stageChange) {
    return false;
  }

  const { prev: previousStageId, current: currentStageId } = stageChange || {};
  if (previousStageId === currentStageId) {
    return false;
  }
  if (fromStageId && previousStageId !== fromStageId) {
    return false;
  }
  if (toStageId && currentStageId !== toStageId) {
    return false;
  }

  const [prevStageExists, currentStageExists] = await Promise.all([
    models.Stages.exists({
      _id: previousStageId,
      pipelineId,
      status: 'active',
    }),
    models.Stages.exists({ _id: currentStageId, pipelineId, status: 'active' }),
  ]);

  if (prevStageExists && currentStageExists) {
    return true;
  }

  return false;
};
