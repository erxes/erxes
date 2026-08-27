import {
  compileSegmentMongoFilter,
  SegmentMemberCount,
  SegmentMemberPage,
  SegmentNode,
  segmentPage,
  segmentPageFilter,
  segmentPageSize,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { SALES_SEGMENT_FIELDS } from './fields';

/**
 * Runs a segment against the deal collection.
 *
 * The tree arrives uncompiled and is turned into a filter with this plugin's
 * own declarations, so no caller can hand sales a query to run.
 */

const DEAL_TYPE = 'sales:sales.deals';

const compile = (contentType: string, node: SegmentNode) => {
  if (contentType !== DEAL_TYPE) {
    return null;
  }

  return compileSegmentMongoFilter(node, {
    fields: SALES_SEGMENT_FIELDS[contentType] || [],
  });
};

export const listDealSegmentMembers = async (
  models: IModels,
  {
    contentType,
    node,
    cursor,
    limit,
    ids,
  }: {
    contentType: string;
    node: SegmentNode;
    cursor?: string;
    limit?: number;
    ids?: string[];
  },
): Promise<SegmentMemberPage> => {
  const compiled = compile(contentType, node);

  if (!compiled) {
    return { ids: [], unsupported: [contentType] };
  }

  const size = segmentPageSize(limit);

  const deals = await models.Deals.find(
    segmentPageFilter(compiled.filter, { cursor, ids }),
    { _id: 1 },
  )
    .sort({ _id: 1 })
    // One extra row answers "is there another page" without a second query.
    .limit(size + 1)
    .lean();

  const page = segmentPage(
    deals.map((deal) => String(deal._id)),
    size,
  );

  return compiled.unsupported.length
    ? { ...page, unsupported: compiled.unsupported }
    : page;
};

export const countDealSegmentMembers = async (
  models: IModels,
  {
    contentType,
    node,
    ids,
  }: { contentType: string; node: SegmentNode; ids?: string[] },
): Promise<SegmentMemberCount> => {
  const compiled = compile(contentType, node);

  if (!compiled) {
    return { count: 0, unsupported: [contentType] };
  }

  const count = await models.Deals.countDocuments(
    segmentPageFilter(compiled.filter, { ids }),
  );

  return compiled.unsupported.length
    ? { count, unsupported: compiled.unsupported }
    : { count };
};
