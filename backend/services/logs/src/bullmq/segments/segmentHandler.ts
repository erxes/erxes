import {
  evaluateSegmentBatch,
  gatherSegmentEventTypes,
  gatherSegmentRelations,
  SegmentApplyMembershipResult,
  SegmentChangedEvent,
  SegmentJob,
  SegmentMembershipUpdate,
  SegmentNode,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { workerSegmentGateway } from './gateway';
import { segmentLog, segmentSkip } from './log';
import { forgetSegments, rebuildSegment } from './rebuild';

/**
 * Keeps segment membership up to date after records change.
 *
 * The whole batch runs here rather than in the services that own the data: if
 * this falls over, the queue holds the work and nothing that a user is waiting
 * on is affected. Everything it needs comes through published contracts.
 *
 * Three questions, in order:
 *   1. which segments read records of this type - including the ones that only
 *      reach them through a relation,
 *   2. whose membership can those changes move - the changed records for a
 *      segment about them, the records on the other end of the relation
 *      otherwise,
 *   3. and for each of those, does the segment still hold.
 */

export type SegmentJobData = SegmentJob;

type DependentSegment = {
  _id: string;
  contentType: string;
  root: SegmentNode;
};

const pluginOf = (contentType: string) => contentType.split(':')[0];

/**
 * Content types already reported as unmapped.
 *
 * Every write in the system arrives here, so most jobs are for a collection no
 * segment is built against - logging each one would drown the trace. Saying it
 * once per type per process keeps the case visible without the noise, which
 * matters because a missing `eventTypes` declaration looks exactly like a
 * working pipeline that found nothing.
 */
const reportedUnmapped = new Set<string>();

const dependentSegments = async (
  subdomain: string,
  contentTypes: string[],
): Promise<DependentSegment[]> =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'dependentSegments',
    input: { contentTypes },
    defaultValue: [],
  });

/**
 * Whose membership a change to these records can move.
 *
 * For a segment about the changed records that is the records themselves. For
 * one that reaches them through a relation it is the other end - a deal moving
 * to a won stage changes the customer's membership, not the deal's.
 */
const subjectsToRecheck = async (
  subdomain: string,
  segment: DependentSegment,
  changedTypes: string[],
  docIds: string[],
): Promise<string[]> => {
  if (changedTypes.includes(segment.contentType)) {
    return docIds;
  }

  const { relations } = await gatherSegmentRelations(segment.contentType);

  const reaching = [...relations.values()].filter(
    (relation) =>
      changedTypes.includes(relation.relatedType) &&
      relation.join.via === 'relation',
  );

  const subjects = new Set<string>();

  for (const relation of reaching) {
    if (relation.join.via !== 'relation') {
      continue;
    }

    const found: string[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'relationSubjects',
      // Core's relation records name their ends their own way, which is what
      // the relation declared - not the segment types.
      input: {
        subjectType: relation.join.subjectRecordType,
        relatedType: relation.join.relatedRecordType,
        relatedIds: docIds,
      },
      defaultValue: [],
    });

    found.forEach((id) => subjects.add(id));
  }

  return [...subjects];
};

/** Hands each owner the membership settled for its own records. */
const applyMembership = async (
  subdomain: string,
  contentType: string,
  updates: SegmentMembershipUpdate[],
): Promise<Record<string, number>> => {
  if (!updates.length) {
    return {};
  }

  const result: SegmentApplyMembershipResult = await sendCoreModuleProducer({
    subdomain,
    moduleName: 'segments',
    pluginName: pluginOf(contentType),
    producerName: TSegmentProducers.APPLY_MEMBERSHIP,
    method: 'mutation',
    input: { contentType, updates },
    defaultValue: { counts: {} } as SegmentApplyMembershipResult,
  });

  // The owner declined the write - it does not implement the producer, or does
  // not claim this content type. Silence here would look like a segment with
  // no members.
  if (result.unsupported?.length) {
    segmentSkip(`${pluginOf(contentType)} did not apply membership`, {
      unsupported: result.unsupported,
    });
  }

  // Only records that changed side are here, so the history stays a record of
  // movement rather than of every time a segment was evaluated.
  if (result.transitions?.length) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'recordTransitions',
      method: 'mutation',
      input: { contentType, transitions: result.transitions },
      defaultValue: { written: 0 },
    });

    segmentLog('membership moved', {
      joined: result.transitions.reduce((n, t) => n + t.joined.length, 0),
      left: result.transitions.reduce((n, t) => n + t.left.length, 0),
    });
  }

  return result.counts || {};
};

/** A change to records, re-deciding whoever it can move. */
const handleChanged = async ({
  subdomain,
  contentType,
  docIds,
}: SegmentChangedEvent) => {
  if (!docIds.length) {
    return;
  }

  const changedTypes = (await gatherSegmentEventTypes()).get(contentType) || [];

  // A collection nothing builds segments against produces no work at all - the
  // common case, since every write in the system arrives here.
  if (!changedTypes.length) {
    if (!reportedUnmapped.has(contentType)) {
      reportedUnmapped.add(contentType);
      segmentSkip(`no segment content type declares ${contentType}`);
    }

    return;
  }

  segmentLog(`${contentType} changed`, {
    records: docIds.length,
    segmentTypes: changedTypes,
  });

  const segments = await dependentSegments(subdomain, changedTypes);

  if (!segments.length) {
    // Reached only for a type some segment is built against, so an empty
    // result usually means `dependsOn` was never written - segments saved
    // before it existed need `segment.rebuildDerivedFields` once.
    segmentSkip('no segment depends on these types', {
      segmentTypes: changedTypes,
    });
    return;
  }

  segmentLog(`${segments.length} dependent segment(s)`, {
    ids: segments.map((segment) => segment._id),
  });

  const gateway = workerSegmentGateway(subdomain);

  // Grouped by the content type that owns the records, so each owner is
  // written to once however many of its segments moved.
  const updatesByType = new Map<string, SegmentMembershipUpdate[]>();

  for (const segment of segments) {
    const subjectIds = await subjectsToRecheck(
      subdomain,
      segment,
      changedTypes,
      docIds,
    );

    if (!subjectIds.length) {
      // A relation the change cannot be traced back through: nothing links
      // these records to any subject of this segment.
      segmentSkip(`${segment._id}: nothing to re-check`, {
        segmentType: segment.contentType,
      });
      continue;
    }

    const { matched, notMatched, undecided } = await evaluateSegmentBatch(
      gateway,
      segment,
      subjectIds,
    );

    segmentLog(`${segment._id}: ${subjectIds.length} subject(s) decided`, {
      matched: matched.length,
      notMatched: notMatched.length,
      undecided: undecided.length,
    });

    // `undecided` is deliberately in neither list: a subject whose value could
    // not be read keeps whatever membership it already had.
    if (!matched.length && !notMatched.length) {
      continue;
    }

    updatesByType.set(segment.contentType, [
      ...(updatesByType.get(segment.contentType) || []),
      { segmentId: segment._id, matched, notMatched },
    ]);
  }

  const counts: Record<string, number> = {};

  for (const [subjectType, updates] of updatesByType) {
    Object.assign(
      counts,
      await applyMembership(subdomain, subjectType, updates),
    );
  }

  if (!Object.keys(counts).length) {
    segmentSkip('nothing was written');
    return;
  }

  segmentLog('membership written', counts);

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'setMembersCount',
    method: 'mutation',
    input: { counts },
    defaultValue: { updated: 0 },
  });
};

export const segmentHandler = async (job: SegmentJob) => {
  if (job.kind === 'rebuild') {
    return rebuildSegment(job);
  }

  if (job.kind === 'forget') {
    return forgetSegments(job);
  }

  // Jobs queued before the kind existed carry none, and they are all changes.
  return handleChanged(job);
};
