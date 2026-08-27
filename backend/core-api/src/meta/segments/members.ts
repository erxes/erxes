import {
  compileSegmentMongoFilter,
  SegmentMemberCount,
  SegmentMemberPage,
  segmentPage,
  segmentPageFilter,
  segmentPageSize,
  SegmentNode,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { SegmentCollection, segmentSource } from './collections';
import { CORE_SEGMENT_FIELDS } from './fields';
import { CORE_SEGMENT_FIELD_NAMESPACES } from './namespaces';

/**
 * Runs a segment against a core collection.
 *
 * The tree arrives uncompiled and is turned into a filter here, with core's own
 * declarations, so no caller can hand this service a query to run.
 */

const compile = (
  models: IModels,
  contentType: string,
  node: SegmentNode,
): {
  collection: SegmentCollection;
  query: Record<string, unknown>;
  unsupported: string[];
} | null => {
  const backing = segmentSource(models, contentType);

  if (!backing) {
    return null;
  }

  const { filter, unsupported } = compileSegmentMongoFilter(node, {
    fields: CORE_SEGMENT_FIELDS[contentType] || [],
    namespaces: CORE_SEGMENT_FIELD_NAMESPACES[contentType],
  });

  const query = Object.keys(filter).length
    ? { ...backing.baseQuery, ...filter }
    : backing.baseQuery;

  return { collection: backing.collection, query, unsupported };
};

export const listCoreSegmentMembers = async (
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
  const compiled = compile(models, contentType, node);

  if (!compiled) {
    return { ids: [], unsupported: [contentType] };
  }

  const size = segmentPageSize(limit);

  const records = await compiled.collection
    .find(segmentPageFilter(compiled.query, { cursor, ids }), { _id: 1 })
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

export const countCoreSegmentMembers = async (
  models: IModels,
  {
    contentType,
    node,
    ids,
  }: { contentType: string; node: SegmentNode; ids?: string[] },
): Promise<SegmentMemberCount> => {
  const compiled = compile(models, contentType, node);

  if (!compiled) {
    return { count: 0, unsupported: [contentType] };
  }

  const count = await compiled.collection.countDocuments(
    segmentPageFilter(compiled.query, { ids }),
  );

  return compiled.unsupported.length
    ? { count, unsupported: compiled.unsupported }
    : { count };
};
