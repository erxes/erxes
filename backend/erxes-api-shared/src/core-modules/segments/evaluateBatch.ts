import { SegmentRelationMeta } from './relationRegistry';
import { decideSegmentNode, SegmentEvaluationState } from './evaluate';

import { SegmentNode } from './nodes';
import {
  buildSegmentEvaluationPlan,
  SegmentEvaluationPlan,
  SegmentValueRequest,
} from './plan';
import { SegmentRelationDirectory } from './relationRegistry';
import { SegmentEvaluateFieldsResult } from './types';
import { DEFAULT_SEGMENT_TIME_ZONE } from './zonedTime';

export type SegmentEvaluationGateway = {
  relationsFor: (subjectType: string) => Promise<SegmentRelationDirectory>;

  timeZone?: () => Promise<string>;

  resolveFields: (
    pluginName: string,
    input: {
      subjectType: string;
      subjectIds: string[];
      requests: SegmentValueRequest[];
      timeZone?: string;
    },
  ) => Promise<SegmentEvaluateFieldsResult>;

  resolveEdges: (args: {
    subjectRecordType: string;
    relatedRecordType: string;
    subjectIds: string[];
  }) => Promise<Record<string, string[]>>;
};

export type SegmentBatchResult = {
  matched: string[];
  notMatched: string[];
  undecided: string[];
};

type ValueTable = Map<string, Map<string, unknown>>;

const mergeInto = (
  table: ValueTable,
  values: SegmentEvaluateFieldsResult['values'],
) => {
  for (const [subjectId, entries] of Object.entries(values)) {
    const current = table.get(subjectId) || new Map<string, unknown>();

    for (const [ref, value] of Object.entries(entries)) {
      current.set(ref, value);
    }

    table.set(subjectId, current);
  }
};

const relationEdges = async (
  gateway: SegmentEvaluationGateway,
  plan: SegmentEvaluationPlan,
  relations: ReadonlyMap<string, SegmentRelationMeta>,
): Promise<Map<string, Record<string, string[]>>> => {
  const relationKeys = new Set(
    [...plan.requestsByPlugin.values()]
      .flat()
      .filter((request) => request.kind === 'relation')
      .map((request) => request.relationKey),
  );

  const keysByPair = new Map<string, string[]>();

  for (const key of relationKeys) {
    const relation = relations.get(key);

    if (!relation || relation.join.via !== 'relation') {
      continue;
    }

    const pair = `${relation.join.subjectRecordType}|${relation.join.relatedRecordType}`;

    keysByPair.set(pair, [...(keysByPair.get(pair) || []), key]);
  }

  const resolved = new Map<string, Record<string, string[]>>();

  await Promise.all(
    [...keysByPair].map(async ([pair, keys]) => {
      const [subjectRecordType, relatedRecordType] = pair.split('|');

      const edges = await gateway.resolveEdges({
        subjectRecordType,
        relatedRecordType,
        subjectIds: plan.subjectIds,
      });

      keys.forEach((key) => resolved.set(key, edges));
    }),
  );

  return resolved;
};

const withEdges = (
  requests: SegmentValueRequest[],
  edges: ReadonlyMap<string, Record<string, string[]>>,
): SegmentValueRequest[] =>
  requests.map((request) =>
    request.kind === 'relation' && edges.has(request.relationKey)
      ? { ...request, edges: edges.get(request.relationKey) }
      : request,
  );

const resolveValues = async (
  gateway: SegmentEvaluationGateway,
  plan: SegmentEvaluationPlan,
  relations: ReadonlyMap<string, SegmentRelationMeta>,
  timeZone: string,
): Promise<{ table: ValueTable; unavailable: Set<string> }> => {
  const table: ValueTable = new Map();
  const unavailable = new Set<string>(plan.unresolvable);

  const edges = await relationEdges(gateway, plan, relations);

  const byPlugin = [...plan.requestsByPlugin];

  const settled = await Promise.allSettled(
    byPlugin.map(([pluginName, requests]) =>
      gateway.resolveFields(pluginName, {
        subjectType: plan.subjectType,
        subjectIds: plan.subjectIds,
        requests: withEdges(requests, edges),
        timeZone,
      }),
    ),
  );

  settled.forEach((outcome, index) => {
    const [, requests] = byPlugin[index];

    if (outcome.status === 'rejected') {
      requests.forEach((request) => unavailable.add(request.ref));
      return;
    }

    mergeInto(table, outcome.value.values);
    (outcome.value.unavailable || []).forEach((ref) => unavailable.add(ref));
  });

  return { table, unavailable };
};

export const evaluateSegmentBatch = async (
  gateway: SegmentEvaluationGateway,
  segment: { _id: string; contentType: string; root: SegmentNode },
  subjectIds: string[],
): Promise<SegmentBatchResult> => {
  const result: SegmentBatchResult = {
    matched: [],
    notMatched: [],
    undecided: [],
  };

  if (!subjectIds.length) {
    return result;
  }

  const { owners, relations } = await gateway.relationsFor(segment.contentType);

  const plan = buildSegmentEvaluationPlan({
    subjectType: segment.contentType,
    subjectIds,
    segments: [{ _id: segment._id, root: segment.root }],
    relationOwners: owners,
  });

  const now = new Date();
  const timeZone = (await gateway.timeZone?.()) || DEFAULT_SEGMENT_TIME_ZONE;

  const { table, unavailable } = await resolveValues(
    gateway,
    plan,
    relations,
    timeZone,
  );

  const bucket: Record<SegmentEvaluationState, string[]> = {
    matched: result.matched,
    notMatched: result.notMatched,
    unknown: result.undecided,
  };

  for (const subjectId of subjectIds) {
    bucket[
      decideSegmentNode(segment.root, {
        subjectType: segment.contentType,
        values: table.get(subjectId) || new Map(),
        unavailable,
        now,
        timeZone,
      })
    ].push(subjectId);
  }

  return result;
};
