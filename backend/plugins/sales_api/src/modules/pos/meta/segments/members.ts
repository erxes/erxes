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
import { posOrderCollection } from './collections';
import { POS_SEGMENT_FIELDS } from './fields';

/**
 * Runs a segment against the order collection.
 *
 * The tree arrives uncompiled and is turned into a filter with this module's
 * own declarations, so no caller can hand pos a query to run.
 */

const compile = (contentType: string, node: SegmentNode, timeZone?: string) => {
  const fields = POS_SEGMENT_FIELDS[contentType];

  return fields ? compileSegmentMongoFilter(node, { fields, timeZone }) : null;
};

export const listPosSegmentMembers = async (
  models: IModels,
  {
    contentType,
    node,
    cursor,
    limit,
    ids,
    timeZone,
  }: {
    contentType: string;
    node: SegmentNode;
    cursor?: string;
    limit?: number;
    ids?: string[];
    timeZone?: string;
  },
): Promise<SegmentMemberPage> => {
  const collection = posOrderCollection(models, contentType);
  const compiled = compile(contentType, node, timeZone);

  if (!collection || !compiled) {
    return { ids: [], unsupported: [contentType] };
  }

  const size = segmentPageSize(limit);

  const records = await collection
    .find(segmentPageFilter(compiled.filter, { cursor, ids }), { _id: 1 })
    .sort({ _id: 1 })
    // One extra row answers "is there another page" without a second query.
    .limit(size + 1)
    .lean();

  const page = segmentPage(
    records.map((record) => String(record._id)),
    size,
  );

  return compiled.unsupported.length
    ? { ...page, unsupported: compiled.unsupported }
    : page;
};

export const countPosSegmentMembers = async (
  models: IModels,
  {
    contentType,
    node,
    ids,
    timeZone,
  }: {
    contentType: string;
    node: SegmentNode;
    ids?: string[];
    timeZone?: string;
  },
): Promise<SegmentMemberCount> => {
  const collection = posOrderCollection(models, contentType);
  const compiled = compile(contentType, node, timeZone);

  if (!collection || !compiled) {
    return { count: 0, unsupported: [contentType] };
  }

  const count = await collection.countDocuments(
    segmentPageFilter(compiled.filter, { ids }),
  );

  return compiled.unsupported.length
    ? { count, unsupported: compiled.unsupported }
    : { count };
};
