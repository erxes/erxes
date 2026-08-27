import {
  compileSegmentMongoFilter,
  SegmentMeasure,
  SegmentMongoFilter,
  SegmentNode,
  SegmentRelationRequest,
} from 'erxes-api-shared/core-modules';
import { PipelineStage } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { SALES_DEAL_SEGMENT_FIELDS } from '../fields/deal';
import { SALES_SEGMENT_RELATIONS } from '../relations';
import { readPath } from './readPath';
import { resolveStageDerivedNode } from './stageFilter';

/**
 * Measures a relation into deals for a batch of subjects.
 *
 * Two joins reach here. A deal that stores the subject's id can be grouped in
 * one aggregation. A deal linked through a core relation record cannot - the
 * edge is not in this database - so core resolves the edges and sends them
 * with the request, and the fold happens over the ids they name. Either way
 * the whole batch costs one query.
 */

export type MeasuredRelations = {
  values: Record<string, Record<string, unknown>>;
  /** Refs this plugin cannot answer, so membership stays unchanged. */
  unavailable: string[];
};

type MeasurePlan =
  | { op: 'exists' }
  | { op: 'none' }
  | { op: 'count' }
  | { op: 'sum' | 'avg' | 'min' | 'max'; path: string };

const relationByKey = (key: string) =>
  SALES_SEGMENT_RELATIONS.find((relation) => relation.key === key);

/** What deals can actually be asked for this measure, if anything. */
const planMeasure = (measure: SegmentMeasure): MeasurePlan | null => {
  if (
    measure.op === 'exists' ||
    measure.op === 'none' ||
    measure.op === 'count'
  ) {
    return { op: measure.op };
  }

  const field = SALES_DEAL_SEGMENT_FIELDS.find(
    (candidate) => candidate.key === measure.fieldKey,
  );

  // Only a stored numeric path can be reduced; a derived field would need its
  // own resolver per deal, which is not what a reduction does.
  if (!field || field.kind !== 'projected' || field.input !== 'number') {
    return null;
  }

  return { op: measure.op, path: field.path };
};

const total = (numbers: number[]) =>
  numbers.reduce((sum, number) => sum + number, 0);

/** Reduces one subject's matching deals to the value the measure asked for. */
const foldMeasure = (plan: MeasurePlan, deals: unknown[]): unknown => {
  if (plan.op === 'exists' || plan.op === 'none') {
    return deals.length > 0;
  }

  if (plan.op === 'count') {
    return deals.length;
  }

  const numbers = deals
    .map((deal) => Number(readPath(deal, plan.path)))
    .filter((number) => !Number.isNaN(number));

  // Nothing bought is nothing spent, so a sum over no deals is zero. An
  // average, minimum or maximum of nothing has no answer and stays unresolved,
  // which leaves those subjects' membership untouched.
  if (plan.op === 'sum') {
    return total(numbers);
  }

  if (!numbers.length) {
    return undefined;
  }

  if (plan.op === 'avg') {
    return total(numbers) / numbers.length;
  }

  return plan.op === 'min' ? Math.min(...numbers) : Math.max(...numbers);
};

/**
 * The predicate narrowing which deals the measure sees, or `null` when part of
 * it cannot be expressed - in which case the measure is reported unavailable
 * rather than counting deals it was told to exclude.
 */
const dealFilter = async (
  models: IModels,
  child?: SegmentNode,
): Promise<SegmentMongoFilter | null> => {
  if (!child) {
    return {};
  }

  const { filter, unsupported } = compileSegmentMongoFilter(
    await resolveStageDerivedNode(models, child),
    { fields: SALES_DEAL_SEGMENT_FIELDS },
  );

  return unsupported.length ? null : filter;
};

const projectionFor = (plan: MeasurePlan) =>
  plan.op === 'exists' || plan.op === 'none' || plan.op === 'count'
    ? { _id: 1 }
    : { _id: 1, [plan.path]: 1 };

/** Deals linked by a core relation record: fold over the ids core resolved. */
const measureOverEdges = async (
  models: IModels,
  subjectIds: string[],
  edges: Record<string, string[]> | undefined,
  plan: MeasurePlan,
  filter: SegmentMongoFilter,
): Promise<Map<string, unknown> | null> => {
  // No edge table means nobody resolved the link, which is undecidable - not
  // the same as a subject having no related deals.
  if (!edges) {
    return null;
  }

  const relatedIds = [
    ...new Set(subjectIds.flatMap((subjectId) => edges[subjectId] || [])),
  ];

  const deals = relatedIds.length
    ? await models.Deals.find(
        { ...filter, _id: { $in: relatedIds } },
        projectionFor(plan),
      ).lean()
    : [];

  const byId = new Map<string, unknown>(
    deals.map((deal) => [String(deal._id), deal]),
  );

  const measured = new Map<string, unknown>();

  for (const subjectId of subjectIds) {
    // Only the ids that came back passed the predicate; the rest were filtered
    // out by the query and must not count.
    const passing = (edges[subjectId] || [])
      .map((dealId) => byId.get(dealId))
      .filter((deal) => deal !== undefined);

    measured.set(subjectId, foldMeasure(plan, passing));
  }

  return measured;
};

type Accumulator =
  | { $sum: 1 | string }
  | { $avg: string }
  | { $min: string }
  | { $max: string };

const accumulatorFor = (plan: MeasurePlan): Accumulator => {
  if (plan.op === 'exists' || plan.op === 'none' || plan.op === 'count') {
    return { $sum: 1 };
  }

  const path = `$${plan.path}`;

  return plan.op === 'sum'
    ? { $sum: path }
    : plan.op === 'avg'
    ? { $avg: path }
    : plan.op === 'min'
    ? { $min: path }
    : { $max: path };
};

/** Deals that store the subject's id: one grouped aggregation for the batch. */
const measureOverJoin = async (
  models: IModels,
  subjectIds: string[],
  joinPath: string,
  plan: MeasurePlan,
  filter: SegmentMongoFilter,
): Promise<Map<string, unknown>> => {
  // Unwinding after the first match keeps the index in play, and matching
  // again afterwards drops the other subjects a shared deal also belongs to.
  const pipeline: PipelineStage[] = [
    { $match: { ...filter, [joinPath]: { $in: subjectIds } } },
    { $unwind: `$${joinPath}` },
    { $match: { [joinPath]: { $in: subjectIds } } },
    {
      $group: { _id: `$${joinPath}`, measured: accumulatorFor(plan) },
    } as PipelineStage,
  ];

  const rows = await models.Deals.aggregate(pipeline);

  const aggregated = new Map(
    rows.map((row: { _id: string; measured: number }) => [
      row._id,
      row.measured,
    ]),
  );

  const measured = new Map<string, unknown>();
  // A subject with no matching deals produces no group, and must still get the
  // same answer the other join would have folded from an empty list.
  const empty = foldMeasure(plan, []);

  for (const subjectId of subjectIds) {
    const row = aggregated.get(subjectId);

    if (row === undefined) {
      measured.set(subjectId, empty);
      continue;
    }

    measured.set(
      subjectId,
      plan.op === 'exists' || plan.op === 'none' ? Boolean(row) : row,
    );
  }

  return measured;
};

export const measureDealRelations = async (
  models: IModels,
  subjectIds: string[],
  requests: SegmentRelationRequest[],
): Promise<MeasuredRelations> => {
  const values: Record<string, Record<string, unknown>> = {};
  const unavailable: string[] = [];

  for (const request of requests) {
    const relation = relationByKey(request.relationKey);
    const plan = relation ? planMeasure(request.measure) : null;
    const filter = plan ? await dealFilter(models, request.child) : null;

    if (!relation || !plan || !filter) {
      unavailable.push(request.ref);
      continue;
    }

    const measured =
      relation.join.via === 'relation'
        ? await measureOverEdges(
            models,
            subjectIds,
            request.edges,
            plan,
            filter,
          )
        : await measureOverJoin(
            models,
            subjectIds,
            relation.join.path,
            plan,
            filter,
          );

    if (!measured) {
      unavailable.push(request.ref);
      continue;
    }

    for (const [subjectId, value] of measured) {
      if (value === undefined) {
        continue;
      }

      values[subjectId] = {
        ...(values[subjectId] || {}),
        [request.ref]: value,
      };
    }
  }

  return { values, unavailable };
};
