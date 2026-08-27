import { decideSegmentNode, SegmentEvaluationState } from './evaluate';
import { SegmentRelationMeta } from './fieldMeta';
import { SegmentNode } from './nodes';
import {
  buildSegmentEvaluationPlan,
  SegmentEvaluationPlan,
  SegmentValueRequest,
} from './plan';
import { SegmentRelationDirectory } from './relationRegistry';
import { SegmentEvaluateFieldsResult } from './types';

/**
 * Decides a batch of records against a segment.
 *
 * Every read happens before any deciding: the plan collects what the whole
 * batch needs, each plugin answers its own share in one call, and only then is
 * the tree walked - in memory, per subject. A segment with fifty conditions
 * still costs one round trip per plugin.
 *
 * The reads themselves come from a gateway rather than a database handle, so
 * the same engine runs wherever it is needed: inside core, which answers for
 * its own records directly, and inside the segmentation worker, where every
 * participant is a service call. One algorithm, two wirings - not two
 * implementations that drift.
 */

export type SegmentEvaluationGateway = {
  /**
   * The relations reachable from a subject type, and who owns each. Part of
   * the gateway because it comes from service discovery, which is as much the
   * outside world as a plugin call is - and keeping it here leaves the engine
   * with no I/O of its own to stub out.
   */
  relationsFor: (subjectType: string) => Promise<SegmentRelationDirectory>;

  /** Asks one plugin for the values behind the refs assigned to it. */
  resolveFields: (
    pluginName: string,
    input: {
      subjectType: string;
      subjectIds: string[];
      requests: SegmentValueRequest[];
    },
  ) => Promise<SegmentEvaluateFieldsResult>;

  /**
   * Subject id -> related ids, for a relation joined through a record neither
   * end stores. Core owns that table, and names its ends its own way, so these
   * are the record types the relation declared - not the segment types.
   */
  resolveEdges: (args: {
    subjectRecordType: string;
    relatedRecordType: string;
    subjectIds: string[];
  }) => Promise<Record<string, string[]>>;
};

export type SegmentBatchResult = {
  matched: string[];
  notMatched: string[];
  /** Subjects whose membership could not be settled, so nothing should change. */
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

  // Edges depend only on the two record types, so relations that reach the
  // same type share one lookup however many measures ask for them.
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

/** Copies the resolved edges onto the requests that travel to a plugin. */
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
): Promise<{ table: ValueTable; unavailable: Set<string> }> => {
  const table: ValueTable = new Map();
  // Refs nothing owns are undecidable from the start.
  const unavailable = new Set<string>(plan.unresolvable);

  // Edges first: a plugin measuring a relation it cannot join by itself has to
  // be told which records to measure.
  const edges = await relationEdges(gateway, plan, relations);

  const byPlugin = [...plan.requestsByPlugin];

  const settled = await Promise.allSettled(
    byPlugin.map(([pluginName, requests]) =>
      gateway.resolveFields(pluginName, {
        subjectType: plan.subjectType,
        subjectIds: plan.subjectIds,
        requests: withEdges(requests, edges),
      }),
    ),
  );

  settled.forEach((outcome, index) => {
    const [, requests] = byPlugin[index];

    // A plugin that failed answers for none of its refs. Marking them
    // unavailable keeps membership untouched instead of deciding against
    // values that were never read.
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

  const { table, unavailable } = await resolveValues(gateway, plan, relations);

  const now = new Date();

  // Three outcomes, three lists: `undecided` is what keeps a subject's
  // membership untouched when a value could not be read, rather than quietly
  // dropping it from the segment.
  const bucket: Record<SegmentEvaluationState, string[]> = {
    matched: result.matched,
    notMatched: result.notMatched,
    unknown: result.undecided,
  };

  for (const subjectId of subjectIds) {
    bucket[
      decideSegmentNode(segment.root, {
        values: table.get(subjectId) || new Map(),
        unavailable,
        now,
      })
    ].push(subjectId);
  }

  return result;
};
