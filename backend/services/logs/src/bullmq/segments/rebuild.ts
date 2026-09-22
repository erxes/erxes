import {
  SegmentApplyMembershipResult,
  segmentDependencyKey,
  SegmentForgetEvent,
  SegmentMembershipUpdate,
  SegmentRebuildEvent,
  sendSegmentRebuild,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { segmentLog, segmentSkip } from './log';

const PAGE = Number(process.env.SEGMENT_REBUILD_PAGE) || 10_000;

const pluginOf = (contentType: string) => contentType.split(':')[0];

const apply = async (
  subdomain: string,
  contentType: string,
  data: {
    updates?: SegmentMembershipUpdate[];
    forget?: string[];
    countFor?: string[];
    transitions?: boolean;
  },
): Promise<SegmentApplyMembershipResult> => {
  const result: SegmentApplyMembershipResult | null =
    await sendCoreModuleProducer({
      subdomain,
      moduleName: 'segments',
      pluginName: pluginOf(contentType),
      producerName: TSegmentProducers.APPLY_MEMBERSHIP,
      method: 'mutation',
      input: { contentType, updates: [], ...data },
      defaultValue: null,
    });

  if (!result) {
    throw new Error(`${contentType} did not answer the membership write`);
  }

  if (result.unsupported?.length) {
    throw new Error(
      `${pluginOf(
        contentType,
      )} declined to write membership for ${result.unsupported.join(', ')}`,
    );
  }

  return result;
};

type StatusResult = { status: string; cancelled?: boolean } | null;

const setStatus = (
  subdomain: string,
  segmentId: string,
  status: 'building' | 'active' | 'failed' | 'cancelled',
  processed?: number,
  total?: number,
  starting?: boolean,
): Promise<StatusResult> =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'setSegmentStatus',
    method: 'mutation',
    input: { segmentId, status, processed, total, starting },
    defaultValue: null,
  });

const estimateTotal = async (
  subdomain: string,
  segmentId: string,
): Promise<number | undefined> => {
  const result: { total: number | null } | null = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'segmentEstimate',
    input: { segmentId },
    defaultValue: null,
  });

  return result?.total ?? undefined;
};

const rebuildReferencing = async (subdomain: string, segmentId: string) => {
  const referencing: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'dependentSegments',
    input: { contentTypes: [segmentDependencyKey(segmentId)] },
    defaultValue: [],
  });

  if (!referencing.length) {
    return;
  }

  segmentLog(`${segmentId}: rebuild cascades`, {
    segments: referencing.map((segment) => segment._id),
  });

  referencing.forEach((segment) =>
    sendSegmentRebuild({ subdomain, segmentId: segment._id }),
  );
};

export const rebuildSegment = async ({
  subdomain,
  segmentId,
}: SegmentRebuildEvent) => {
  const segment: { _id: string; contentType: string } | null =
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'findOne',
      input: { _id: segmentId },
      defaultValue: null,
    });

  if (!segment) {
    segmentSkip(`${segmentId}: gone before its rebuild ran`);
    return;
  }

  const { contentType } = segment;

  await setStatus(subdomain, segmentId, 'building', 0, undefined, true);

  const total = await estimateTotal(subdomain, segmentId);

  segmentLog(`${segmentId}: rebuilding`, { contentType, total: total ?? '?' });

  if (total !== undefined) {
    await setStatus(subdomain, segmentId, 'building', 0, total, false);
  }

  try {
    let cursor: string | undefined;
    let members = 0;

    let cancelled = Boolean(
      (await setStatus(subdomain, segmentId, 'building', 0, total, false))
        ?.cancelled,
    );

    if (!cancelled) {
      await apply(subdomain, contentType, { forget: [segmentId] });

      cancelled = Boolean(
        (await setStatus(subdomain, segmentId, 'building', 0, total, false))
          ?.cancelled,
      );
    }

    while (!cancelled) {
      const page: { ids: string[]; nextCursor?: string } | null =
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'segment',
          action: 'fetchSegment',
          input: { segmentId, cursor, limit: PAGE },
          defaultValue: null,
        });

      if (!page) {
        throw new Error(
          `${segmentId}: could not read the page after ${members} member(s)`,
        );
      }

      if (!cursor || !page.ids.length) {
        segmentLog(`${segmentId}: page returned ${page.ids.length} id(s)`, {
          cursor: cursor || '(first)',
          more: Boolean(page.nextCursor),
        });
      }

      if (page.ids.length) {
        await apply(subdomain, contentType, {
          updates: [{ segmentId, matched: page.ids, notMatched: [] }],
          countFor: [],
          transitions: false,
        });

        members += page.ids.length;

        const progress = await setStatus(
          subdomain,
          segmentId,
          'building',
          members,
          total,
        );

        if (progress?.cancelled) {
          cancelled = true;
          break;
        }
      }

      if (!page.nextCursor) {
        break;
      }

      cursor = page.nextCursor;
    }

    const settled = await apply(subdomain, contentType, {
      countFor: [segmentId],
    });

    const membersCount = settled.counts?.[segmentId] ?? members;

    await setStatus(subdomain, segmentId, cancelled ? 'cancelled' : 'active');

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'setMembersCount',
      method: 'mutation',
      input: {
        counts: { [segmentId]: membersCount },
        countedAt: settled.countedAt,
        anchor: true,
      },
      defaultValue: { updated: 0 },
    });

    if (cancelled) {
      segmentLog(`${segmentId}: stopped`, { members: membersCount });
      return;
    }

    segmentLog(`${segmentId}: rebuilt`, { members: membersCount });

    await rebuildReferencing(subdomain, segmentId);
  } catch (error) {
    await setStatus(subdomain, segmentId, 'failed');
    throw error;
  }
};

export const forgetSegments = async ({
  subdomain,
  contentType,
  segmentIds,
}: SegmentForgetEvent) => {
  await apply(subdomain, contentType, { forget: segmentIds });

  segmentLog('membership stripped for removed segment(s)', {
    contentType,
    segmentIds,
  });
};
