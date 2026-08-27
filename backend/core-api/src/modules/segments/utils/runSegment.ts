import {
  evaluateSegmentBatch,
  SegmentMemberCount,
  SegmentMemberPage,
  SegmentNode,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  countCoreSegmentMembers,
  listCoreSegmentMembers,
} from '~/meta/segments/members';
import { ISegmentDocument } from '../db/definitions/segments';
import { coreSegmentGateway } from './segmentGateway';

/**
 * Resolves a segment to the records it contains.
 *
 * The tree is sent to whichever plugin owns the content type and compiled
 * there, so core never queries another service's collection and never hands
 * one a query to run.
 */

const pluginOf = (contentType: string) => contentType.split(':')[0];

type MemberQueryInput = {
  contentType: string;
  node: SegmentNode;
  cursor?: string;
  limit?: number;
  ids?: string[];
};

/**
 * Narrows a candidate page down to the records that actually match.
 *
 * A filter can only express the conditions that live on the subject's own
 * documents; a count of a customer's deals has to be measured. So the filter
 * picks candidates and the evaluator settles them, which is exact as long as
 * something in the definition was filterable enough to narrow the field.
 */
const settleCandidates = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
  page: SegmentMemberPage,
): Promise<SegmentMemberPage> => {
  if (!page.unsupported?.length || !page.ids.length) {
    return page;
  }

  const { matched } = await evaluateSegmentBatch(
    coreSegmentGateway(models, subdomain),
    segment,
    page.ids,
  );

  // The cursor still comes from the candidates, so paging continues past the
  // ones evaluation dropped.
  return { ids: matched, nextCursor: page.nextCursor };
};

export const listSegmentMembers = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
  page: { cursor?: string; limit?: number; ids?: string[] } = {},
): Promise<SegmentMemberPage> => {
  const input: MemberQueryInput = {
    contentType: segment.contentType,
    node: segment.root,
    ...page,
  };

  // Core answers for its own content types directly; a round trip through the
  // gateway to reach ourselves would only add latency.
  const candidates =
    pluginOf(segment.contentType) === 'core'
      ? await listCoreSegmentMembers(models, input)
      : await sendCoreModuleProducer({
          subdomain,
          moduleName: 'segments',
          pluginName: pluginOf(segment.contentType),
          producerName: TSegmentProducers.LIST_MEMBERS,
          method: 'query',
          input,
          defaultValue: { ids: [] } as SegmentMemberPage,
        });

  return settleCandidates(models, subdomain, segment, candidates);
};

export const countSegmentMembers = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
): Promise<SegmentMemberCount> => {
  const input: MemberQueryInput = {
    contentType: segment.contentType,
    node: segment.root,
  };

  const counted =
    pluginOf(segment.contentType) === 'core'
      ? await countCoreSegmentMembers(models, input)
      : await sendCoreModuleProducer({
          subdomain,
          moduleName: 'segments',
          pluginName: pluginOf(segment.contentType),
          producerName: TSegmentProducers.COUNT_MEMBERS,
          method: 'query',
          input,
          defaultValue: { count: 0 } as SegmentMemberCount,
        });

  if (!counted.unsupported?.length) {
    return counted;
  }

  // Part of the definition could not be filtered, so the filter's count is an
  // upper bound. Paging through the candidates and evaluating each page is the
  // only exact answer short of materialised membership.
  let count = 0;
  let cursor: string | undefined;

  for (;;) {
    const page = await listSegmentMembers(models, subdomain, segment, {
      cursor,
    });

    count += page.ids.length;

    if (!page.nextCursor) {
      return { count };
    }

    cursor = page.nextCursor;
  }
};

/** Every member id, paged through so no single response carries the whole set. */
export const collectSegmentMembers = async (
  models: IModels,
  subdomain: string,
  segment: ISegmentDocument,
): Promise<string[]> => {
  const ids: string[] = [];
  let cursor: string | undefined;

  for (;;) {
    const page = await listSegmentMembers(models, subdomain, segment, {
      cursor,
    });

    ids.push(...page.ids);

    if (!page.nextCursor) {
      return ids;
    }

    cursor = page.nextCursor;
  }
};
