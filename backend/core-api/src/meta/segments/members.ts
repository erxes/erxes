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

const compile = (
  models: IModels,
  contentType: string,
  node: SegmentNode,
  timeZone?: string,
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
    timeZone,
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
  const compiled = compile(models, contentType, node, timeZone);

  if (!compiled) {
    return { ids: [], unsupported: [contentType] };
  }

  const size = segmentPageSize(limit);

  const records = await compiled.collection
    .find(segmentPageFilter(compiled.query, { cursor, ids }), { _id: 1 })
    .sort({ _id: 1 })
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
    budgetMs,
    timeZone,
  }: {
    contentType: string;
    node: SegmentNode;
    ids?: string[];
    budgetMs?: number;
    timeZone?: string;
  },
): Promise<SegmentMemberCount> => {
  const compiled = compile(models, contentType, node, timeZone);

  if (!compiled) {
    return { count: 0, unsupported: [contentType] };
  }

  let count: number;

  try {
    count = await compiled.collection.countDocuments(
      segmentPageFilter(compiled.query, { ids }),
      budgetMs ? { maxTimeMS: budgetMs } : undefined,
    );
  } catch (error) {
    if (budgetMs && /time limit|maxTimeMS|exceeded/i.test(String(error))) {
      return { count: 0, exceeded: true };
    }

    throw error;
  }

  return compiled.unsupported.length
    ? { count, unsupported: compiled.unsupported }
    : { count };
};
