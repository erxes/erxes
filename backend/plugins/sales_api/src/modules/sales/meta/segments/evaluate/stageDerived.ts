import { SegmentDerivedRequest } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { STAGE_DERIVED_FIELDS } from './stageFilter';

const STAGE_DERIVED = new Set(STAGE_DERIVED_FIELDS);

export const resolveStageDerived = async (
  models: IModels,
  requests: SegmentDerivedRequest[],
  subjectIds: string[],
): Promise<Record<string, Record<string, unknown>>> => {
  const mine = requests.filter((request) =>
    STAGE_DERIVED.has(request.fieldKey),
  );

  if (!mine.length || !subjectIds.length) {
    return {};
  }

  const deals = await models.Deals.find(
    { _id: { $in: subjectIds } },
    { _id: 1, stageId: 1 },
  ).lean();

  const stageIds = [
    ...new Set(deals.map((deal) => deal.stageId).filter(Boolean)),
  ];

  const stages = await models.Stages.find(
    { _id: { $in: stageIds } },
    { _id: 1, pipelineId: 1, probability: 1 },
  ).lean();

  const stageById = new Map(stages.map((stage) => [stage._id, stage]));

  const boardByPipeline = new Map<string, string>();

  if (mine.some((request) => request.fieldKey === 'boardId')) {
    const pipelineIds = [
      ...new Set(stages.map((stage) => stage.pipelineId).filter(Boolean)),
    ];

    const pipelines = await models.Pipelines.find(
      { _id: { $in: pipelineIds } },
      { _id: 1, boardId: 1 },
    ).lean();

    for (const pipeline of pipelines) {
      boardByPipeline.set(pipeline._id, pipeline.boardId);
    }
  }

  const valueOf = (
    fieldKey: string,
    stage?: { pipelineId?: string; probability?: string },
  ): unknown => {
    if (fieldKey === 'pipelineId') {
      return stage?.pipelineId;
    }

    if (fieldKey === 'stageProbability') {
      return stage?.probability;
    }

    return stage?.pipelineId
      ? boardByPipeline.get(stage.pipelineId)
      : undefined;
  };

  const values: Record<string, Record<string, unknown>> = {};

  for (const deal of deals) {
    const stage = deal.stageId ? stageById.get(deal.stageId) : undefined;

    for (const request of mine) {
      const value = valueOf(request.fieldKey, stage);

      if (value !== undefined) {
        values[deal._id] = {
          ...(values[deal._id] || {}),
          [request.ref]: value,
        };
      }
    }
  }

  return values;
};
