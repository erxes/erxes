import {
  SegmentApplyMembershipResult,
  SegmentForgetEvent,
  SegmentMembershipUpdate,
  SegmentRebuildEvent,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { segmentLog, segmentSkip } from './log';

/**
 * Rebuilds a segment's membership from its definition.
 *
 * Record-driven work re-decides only the records that moved, which cannot
 * notice that the question changed. An edited definition therefore needs its
 * whole answer recomputed, and that is what this does.
 *
 * The old membership is cleared first and the new one written page by page, so
 * the worker never holds more than one page of ids however large the segment
 * is. The cost is a window where the segment really is empty, which is why it
 * is marked `building` for the duration rather than left looking wrong.
 */

const PAGE = 1000;

const pluginOf = (contentType: string) => contentType.split(':')[0];

const apply = (
  subdomain: string,
  contentType: string,
  data: { updates?: SegmentMembershipUpdate[]; forget?: string[] },
): Promise<SegmentApplyMembershipResult> =>
  sendCoreModuleProducer({
    subdomain,
    moduleName: 'segments',
    pluginName: pluginOf(contentType),
    producerName: TSegmentProducers.APPLY_MEMBERSHIP,
    method: 'mutation',
    input: { contentType, updates: [], ...data },
    defaultValue: { counts: {} } as SegmentApplyMembershipResult,
  });

const setStatus = (
  subdomain: string,
  segmentId: string,
  status: 'building' | 'active' | 'failed',
  processed?: number,
) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'setSegmentStatus',
    method: 'mutation',
    input: { segmentId, status, processed },
    defaultValue: null,
  });

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

  segmentLog(`${segmentId}: rebuilding`, { contentType });

  await setStatus(subdomain, segmentId, 'building');

  try {
    await apply(subdomain, contentType, { forget: [segmentId] });

    let cursor: string | undefined;
    let members = 0;

    for (;;) {
      // Core runs the definition and settles the parts a filter cannot express,
      // so the worker gets members rather than candidates.
      const page: { ids: string[]; nextCursor?: string } =
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'segment',
          action: 'fetchSegment',
          input: { segmentId, cursor, limit: PAGE },
          defaultValue: { ids: [] },
        });

      if (page.ids.length) {
        await apply(subdomain, contentType, {
          updates: [{ segmentId, matched: page.ids, notMatched: [] }],
        });

        members += page.ids.length;

        // Reported per page so a long build is visibly moving rather than
        // just "building" for minutes.
        await setStatus(subdomain, segmentId, 'building', members);
      }

      if (!page.nextCursor) {
        break;
      }

      cursor = page.nextCursor;
    }

    await setStatus(subdomain, segmentId, 'active');

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'setMembersCount',
      method: 'mutation',
      input: { counts: { [segmentId]: members } },
      defaultValue: { updated: 0 },
    });

    segmentLog(`${segmentId}: rebuilt`, { members });
  } catch (error) {
    // Left as failed rather than active: an interrupted rebuild has written
    // part of the new answer over none of the old one, and saying it succeeded
    // would hide that.
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
