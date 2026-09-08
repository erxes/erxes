import {
  evaluateSegmentBatch,
  gatherSegmentEventTypes,
  gatherSegmentFieldSources,
  gatherSegmentRelations,
  SegmentApplyMembershipResult,
  SegmentChangedEvent,
  segmentDependencyKey,
  SegmentJob,
  SegmentMemberPage,
  SegmentMembershipUpdate,
  SegmentNode,
  SegmentOperator,
  sendSegmentChanged,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { workerSegmentGateway } from './gateway';
import { segmentLog, segmentSkip } from './log';
import { reconcileSegments } from './reconcile';
import { forgetSegments, rebuildSegment } from './rebuild';

export type SegmentJobData = SegmentJob;

type DependentSegment = {
  _id: string;
  contentType: string;
  root: SegmentNode;
};

const pluginOf = (contentType: string) => contentType.split(':')[0];

const reportedUnmapped = new Set<string>();

const dependentSegments = async (
  subdomain: string,
  input: { contentTypes?: string[]; ids?: string[] },
): Promise<DependentSegment[]> =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'dependentSegments',
    input,
    defaultValue: [],
  });

const idsAt = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  );

const subjectsToRecheck = async (
  subdomain: string,
  segment: DependentSegment,
  changedTypes: string[],
  docIds: string[],
  changed?: SegmentChangedEvent['changed'],
): Promise<string[]> => {
  if (changedTypes.includes(segment.contentType)) {
    return docIds;
  }

  const { relations } = await gatherSegmentRelations(segment.contentType);

  const reaching = [...relations.values()].filter((relation) =>
    changedTypes.includes(relation.relatedType),
  );

  const subjects = new Set<string>();

  for (const relation of reaching) {
    if (relation.join.via === 'field') {
      const moved = changed?.[relation.join.path];

      if (relation.join.on === 'subject') {
        docIds.forEach((id) => subjects.add(id));
      } else if (moved) {
        idsAt(moved.prev).forEach((id) => subjects.add(id));
        idsAt(moved.next).forEach((id) => subjects.add(id));
      } else {
        segmentSkip(`${segment._id}: ${relation.key} moved without a diff`, {
          relatedType: relation.relatedType,
        });
      }

      continue;
    }

    const found: string[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'relationSubjects',
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

const READER_PAGE = 2000;

const dispatchSourceReaders = async (
  subdomain: string,
  contentType: string,
  docIds: string[],
) => {
  const { bySource } = await gatherSegmentFieldSources();
  const links = bySource.get(contentType) || [];

  if (!links.length) {
    return;
  }

  const segments = await dependentSegments(subdomain, {
    contentTypes: [contentType],
  });

  if (!segments.length) {
    segmentSkip(`no segment reads through ${contentType}`);
    return;
  }

  const segmentIds = segments.map((segment) => segment._id);

  for (const link of links) {
    let cursor: string | undefined;
    let dispatched = 0;

    do {
      const page: SegmentMemberPage = await sendCoreModuleProducer({
        subdomain,
        moduleName: 'segments',
        pluginName: pluginOf(link.subjectType),
        producerName: TSegmentProducers.LIST_MEMBERS,
        method: 'query',
        input: {
          contentType: link.subjectType,
          node: {
            kind: 'field',
            contentType: link.subjectType,
            fieldKey: link.via,
            operator: SegmentOperator.In,
            value: docIds,
          },
          cursor,
          limit: READER_PAGE,
        },
        defaultValue: { ids: [] } as SegmentMemberPage,
      });

      if (page.ids.length) {
        dispatched += page.ids.length;

        sendSegmentChanged({
          subdomain,
          contentType: link.subjectType,
          docIds: page.ids,
          segmentIds,
        });
      }

      cursor = page.nextCursor;
    } while (cursor);

    if (dispatched) {
      segmentLog(`${contentType} moved ${link.subjectType}`, {
        readers: dispatched,
        via: link.via,
        segments: segmentIds.length,
      });
    }
  }
};

type AppliedMembership = {
  counts: Record<string, number>;
  countedAt?: string;
  transitions: NonNullable<SegmentApplyMembershipResult['transitions']>;
};

const applyMembership = async (
  subdomain: string,
  contentType: string,
  updates: SegmentMembershipUpdate[],
): Promise<AppliedMembership> => {
  if (!updates.length) {
    return { counts: {}, transitions: [] };
  }

  const result: SegmentApplyMembershipResult | null =
    await sendCoreModuleProducer({
      subdomain,
      moduleName: 'segments',
      pluginName: pluginOf(contentType),
      producerName: TSegmentProducers.APPLY_MEMBERSHIP,
      method: 'mutation',
      input: { contentType, updates, countFor: [] },
      defaultValue: null,
    });

  if (!result) {
    throw new Error(`${contentType} did not answer the membership write`);
  }

  if (result.unsupported?.length) {
    segmentSkip(`${pluginOf(contentType)} did not apply membership`, {
      unsupported: result.unsupported,
    });
  }

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

  return {
    counts: result.counts || {},
    countedAt: result.countedAt,
    transitions: result.transitions || [],
  };
};

const cascadeToReferencing = async (
  subdomain: string,
  contentType: string,
  transitions: AppliedMembership['transitions'],
) => {
  if (!transitions.length) {
    return;
  }

  const referencing = await dependentSegments(subdomain, {
    contentTypes: transitions.map((transition) =>
      segmentDependencyKey(transition.segmentId),
    ),
  });

  if (!referencing.length) {
    return;
  }

  const docIds = [
    ...new Set(
      transitions.flatMap((transition) => [
        ...transition.joined,
        ...transition.left,
      ]),
    ),
  ];

  segmentLog('membership move cascades', {
    records: docIds.length,
    segments: referencing.map((segment) => segment._id),
  });

  sendSegmentChanged({
    subdomain,
    contentType,
    docIds,
    segmentIds: referencing.map((segment) => segment._id),
  });
};

const handleChanged = async ({
  subdomain,
  contentType,
  docIds,
  segmentIds,
  changed,
}: SegmentChangedEvent) => {
  if (!docIds.length) {
    return;
  }

  const targeted = Boolean(segmentIds?.length);

  const changedTypes = targeted
    ? [contentType]
    : (await gatherSegmentEventTypes()).get(contentType) || [];

  if (!targeted) {
    await dispatchSourceReaders(subdomain, contentType, docIds);
  }

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

  const segments = await dependentSegments(
    subdomain,
    targeted ? { ids: segmentIds } : { contentTypes: changedTypes },
  );

  if (!segments.length) {
    segmentSkip('no segment depends on these types', {
      segmentTypes: changedTypes,
    });
    return;
  }

  segmentLog(`${segments.length} dependent segment(s)`, {
    ids: segments.map((segment) => segment._id),
  });

  const gateway = workerSegmentGateway(subdomain);

  const updatesByType = new Map<string, SegmentMembershipUpdate[]>();

  for (const segment of segments) {
    const subjectIds = await subjectsToRecheck(
      subdomain,
      segment,
      changedTypes,
      docIds,
      changed,
    );

    if (!subjectIds.length) {
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

    if (!matched.length && !notMatched.length) {
      continue;
    }

    updatesByType.set(segment.contentType, [
      ...(updatesByType.get(segment.contentType) || []),
      { segmentId: segment._id, matched, notMatched },
    ]);
  }

  const deltas: Record<string, number> = {};

  for (const [subjectType, updates] of updatesByType) {
    const applied = await applyMembership(subdomain, subjectType, updates);

    for (const { segmentId, joined, left } of applied.transitions) {
      deltas[segmentId] =
        (deltas[segmentId] || 0) + joined.length - left.length;
    }

    await cascadeToReferencing(subdomain, subjectType, applied.transitions);
  }

  const moved = Object.entries(deltas).filter(([, delta]) => delta !== 0);

  if (!moved.length) {
    segmentSkip('nothing changed side');
    return;
  }

  segmentLog('member counts adjusted', Object.fromEntries(moved));

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'adjustMembersCount',
    method: 'mutation',
    input: { deltas: Object.fromEntries(moved), at: new Date().toISOString() },
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

  if (job.kind === 'reconcile') {
    return reconcileSegments(job);
  }

  return handleChanged(job);
};
