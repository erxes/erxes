import {
  projectionForRequests,
  SegmentDerivedRequest,
  SegmentEvaluateFieldsResult,
  SegmentProjectedRequest,
  splitSegmentFieldRequests,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { SALES_DEAL_SEGMENT_FIELDS } from '../fields/deal';
import { readPath } from './readPath';
import { measureDealRelations } from './relations';
import { STAGE_DERIVED_FIELDS } from './stageFilter';

/**
 * Resolves one batch of deals against the refs a plan assigned to this plugin.
 *
 * Every branch here is batch-shaped: projected fields come back in a single
 * find with a merged projection, and the three stage-derived fields cost at
 * most two more queries no matter how many deals are in the batch.
 */

const DEAL_TYPE = 'sales:sales.deals';

const SEGMENT_FIELDS = { [DEAL_TYPE]: SALES_DEAL_SEGMENT_FIELDS };

const STAGE_DERIVED = new Set(STAGE_DERIVED_FIELDS);

type ValueTable = Record<string, Record<string, unknown>>;

const put = (
  values: ValueTable,
  subjectId: string,
  ref: string,
  value: unknown,
) => {
  if (value === undefined) {
    return;
  }

  values[subjectId] = { ...(values[subjectId] || {}), [ref]: value };
};

const resolveProjected = async (
  models: IModels,
  subjectIds: string[],
  projected: SegmentProjectedRequest[],
  values: ValueTable,
) => {
  if (!projected.length) {
    return;
  }

  const deals = await models.Deals.find(
    { _id: { $in: subjectIds } },
    projectionForRequests(projected),
  ).lean();

  for (const deal of deals) {
    for (const request of projected) {
      put(values, deal._id, request.ref, readPath(deal, request.path));
    }
  }
};

/**
 * A deal stores only `stageId`; board, pipeline and probability hang off the
 * stage, so they are resolved once per distinct stage rather than per deal.
 */
const resolveStageDerived = async (
  models: IModels,
  subjectIds: string[],
  derived: SegmentDerivedRequest[],
  values: ValueTable,
) => {
  if (!derived.length) {
    return;
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

  const needsBoard = derived.some((request) => request.fieldKey === 'boardId');
  const boardByPipeline = new Map<string, string>();

  if (needsBoard) {
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

  for (const deal of deals) {
    const stage = deal.stageId ? stageById.get(deal.stageId) : undefined;

    for (const request of derived) {
      if (request.fieldKey === 'pipelineId') {
        put(values, deal._id, request.ref, stage?.pipelineId);
      }

      if (request.fieldKey === 'stageProbability') {
        put(values, deal._id, request.ref, stage?.probability);
      }

      if (request.fieldKey === 'boardId') {
        put(
          values,
          deal._id,
          request.ref,
          stage?.pipelineId ? boardByPipeline.get(stage.pipelineId) : undefined,
        );
      }
    }
  }
};

export const evaluateDealFields = async (
  models: IModels,
  {
    subjectType,
    subjectIds,
    requests,
  }: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
  },
): Promise<SegmentEvaluateFieldsResult> => {
  const values: ValueTable = {};
  const unavailable: string[] = [];

  if (!subjectIds.length) {
    return { values, unavailable: requests.map((request) => request.ref) };
  }

  // A relation is measured from whatever subject owns it, so those requests
  // arrive with a subject type this plugin does not own - that is the point.
  const isDealSubject = subjectType === DEAL_TYPE;

  // A field owned by another content type needs a relation to reach it from
  // these ids. Until relation meta exists, say so rather than answer "unset"
  // and quietly drop those subjects out of the segment.
  const reachable = requests.filter(
    (request) =>
      request.kind === 'relation' ||
      (isDealSubject && request.contentType === DEAL_TYPE),
  );

  for (const request of requests) {
    if (!reachable.includes(request)) {
      unavailable.push(request.ref);
    }
  }

  const split = splitSegmentFieldRequests(reachable, SEGMENT_FIELDS);

  unavailable.push(...split.undeclared);

  const stageDerived = split.derived.filter((request) =>
    STAGE_DERIVED.has(request.fieldKey),
  );

  unavailable.push(
    ...split.derived
      .filter((request) => !STAGE_DERIVED.has(request.fieldKey))
      .map((request) => request.ref),
  );

  const [, , measured] = await Promise.all([
    resolveProjected(models, subjectIds, split.projected, values),
    resolveStageDerived(models, subjectIds, stageDerived, values),
    measureDealRelations(models, subjectIds, split.relations),
  ]);

  unavailable.push(...measured.unavailable);

  for (const [subjectId, entries] of Object.entries(measured.values)) {
    values[subjectId] = { ...(values[subjectId] || {}), ...entries };
  }

  return unavailable.length ? { values, unavailable } : { values };
};
