import { SegmentRelationMeta } from './relationRegistry';
import { SegmentFieldMeta } from './fieldMeta';
import { readSegmentPath } from './fieldRequests';
import { compileSegmentMongoFilter, SegmentMongoFilter } from './mongoFilter';
import { SegmentMeasure, SegmentNode } from './nodes';
import { SegmentOwnedSource, SegmentSourceResolver } from './ownedSource';
import { SegmentRelationRequest } from './plan';

export type MeasuredRelations = {
  values: Record<string, Record<string, unknown>>;
  unavailable: string[];
};

export type MeasureRelationsContext = {
  sourceFor: SegmentSourceResolver;
  relations: SegmentRelationMeta[];
  fields: Record<string, SegmentFieldMeta[]>;
  timeZone?: string;
  rewritePredicate?: (node: SegmentNode) => Promise<SegmentNode>;
};

type MeasurePlan =
  | { op: 'exists' }
  | { op: 'none' }
  | { op: 'count' }
  | { op: 'sum' | 'avg' | 'min' | 'max'; path: string };

const planMeasure = (
  measure: SegmentMeasure,
  fields: SegmentFieldMeta[],
): MeasurePlan | null => {
  if (
    measure.op === 'exists' ||
    measure.op === 'none' ||
    measure.op === 'count'
  ) {
    return { op: measure.op };
  }

  const field = fields.find((candidate) => candidate.key === measure.fieldKey);

  if (!field || field.kind !== 'projected' || field.input !== 'number') {
    return null;
  }

  return { op: measure.op, path: field.path };
};

const total = (numbers: number[]) =>
  numbers.reduce((sum, number) => sum + number, 0);

const foldMeasure = (plan: MeasurePlan, records: unknown[]): unknown => {
  if (plan.op === 'exists' || plan.op === 'none') {
    return records.length > 0;
  }

  if (plan.op === 'count') {
    return records.length;
  }

  const numbers = records
    .map((record) => Number(readSegmentPath(record, plan.path)))
    .filter((number) => !Number.isNaN(number));

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

const projectionFor = (plan: MeasurePlan): Record<string, 1> =>
  plan.op === 'exists' || plan.op === 'none' || plan.op === 'count'
    ? { _id: 1 }
    : { _id: 1, [plan.path]: 1 };

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

const measureOverEdges = async (
  source: SegmentOwnedSource,
  subjectIds: string[],
  edges: Record<string, string[]> | undefined,
  plan: MeasurePlan,
  filter: SegmentMongoFilter,
): Promise<Map<string, unknown> | null> => {
  if (!edges) {
    return null;
  }

  const relatedIds = [
    ...new Set(subjectIds.flatMap((subjectId) => edges[subjectId] || [])),
  ];

  const records = relatedIds.length
    ? await source.find(
        { ...(source.baseQuery || {}), ...filter, _id: { $in: relatedIds } },
        projectionFor(plan),
      )
    : [];

  const byId = new Map<string, unknown>(
    records.map((record) => [String(record._id), record]),
  );

  const measured = new Map<string, unknown>();

  for (const subjectId of subjectIds) {
    const passing = (edges[subjectId] || [])
      .map((relatedId) => byId.get(relatedId))
      .filter((record) => record !== undefined);

    measured.set(subjectId, foldMeasure(plan, passing));
  }

  return measured;
};

const measureOverJoin = async (
  source: SegmentOwnedSource,
  subjectIds: string[],
  joinPath: string,
  plan: MeasurePlan,
  filter: SegmentMongoFilter,
): Promise<Map<string, unknown> | null> => {
  if (!source.aggregate) {
    return null;
  }

  const rows = await source.aggregate([
    {
      $match: {
        ...(source.baseQuery || {}),
        ...filter,
        [joinPath]: { $in: subjectIds },
      },
    },
    { $unwind: `$${joinPath}` },
    { $match: { [joinPath]: { $in: subjectIds } } },
    { $group: { _id: `$${joinPath}`, measured: accumulatorFor(plan) } },
  ]);

  const aggregated = new Map(
    rows.map((row) => [String(row._id), row.measured as number]),
  );

  const measured = new Map<string, unknown>();
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

const edgesFromSubjects = async (
  subjects: SegmentOwnedSource,
  subjectIds: string[],
  path: string,
): Promise<Record<string, string[]>> => {
  const records = await subjects.find(
    { ...(subjects.baseQuery || {}), _id: { $in: subjectIds } },
    { _id: 1, [path.split('.')[0]]: 1 },
  );

  const edges: Record<string, string[]> = {};

  for (const record of records) {
    const value = readSegmentPath(record, path);

    edges[String(record._id)] = (Array.isArray(value) ? value : [value]).filter(
      (id): id is string => typeof id === 'string' && id.length > 0,
    );
  }

  return edges;
};

const predicateFilter = async (
  context: MeasureRelationsContext,
  relatedType: string,
  child?: SegmentNode,
): Promise<SegmentMongoFilter | null> => {
  if (!child) {
    return {};
  }

  const node = context.rewritePredicate
    ? await context.rewritePredicate(child)
    : child;

  const { filter, unsupported } = compileSegmentMongoFilter(node, {
    fields: context.fields[relatedType] || [],
    timeZone: context.timeZone,
  });

  return unsupported.length ? null : filter;
};

export const measureSegmentRelations = async (
  context: MeasureRelationsContext,
  subjectType: string,
  subjectIds: string[],
  requests: SegmentRelationRequest[],
): Promise<MeasuredRelations> => {
  const values: Record<string, Record<string, unknown>> = {};
  const unavailable: string[] = [];

  for (const request of requests) {
    const relation = context.relations.find(
      (candidate) => candidate.key === request.relationKey,
    );

    const related = relation ? context.sourceFor(relation.relatedType) : null;

    const plan =
      relation && related
        ? planMeasure(
            request.measure,
            context.fields[relation.relatedType] || [],
          )
        : null;

    const filter =
      relation && plan
        ? await predicateFilter(context, relation.relatedType, request.child)
        : null;

    if (!relation || !related || !plan || !filter) {
      unavailable.push(request.ref);
      continue;
    }

    let measured: Map<string, unknown> | null;

    if (relation.join.via === 'relation') {
      measured = await measureOverEdges(
        related,
        subjectIds,
        request.edges,
        plan,
        filter,
      );
    } else if (relation.join.on === 'related') {
      measured = await measureOverJoin(
        related,
        subjectIds,
        relation.join.path,
        plan,
        filter,
      );
    } else {
      const subjects = context.sourceFor(subjectType);

      measured = subjects
        ? await measureOverEdges(
            related,
            subjectIds,
            await edgesFromSubjects(subjects, subjectIds, relation.join.path),
            plan,
            filter,
          )
        : null;
    }

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
