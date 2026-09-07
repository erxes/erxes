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
import { DEAL_TYPE } from './collections';
import { SALES_SEGMENT_FIELDS } from './fields';

type PagedCollection = {
  countDocuments: (filter: Record<string, unknown>) => Promise<number>;
  find: (
    query: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => {
    sort: (order: Record<string, 1>) => {
      limit: (count: number) => { lean: () => Promise<{ _id: string }[]> };
    };
  };
};

const pagedCollection = (
  models: IModels,
  contentType: string,
): PagedCollection | null => {
  const as = (model: unknown) => model as PagedCollection;

  if (contentType === DEAL_TYPE) {
    return as(models.Deals);
  }

  return null;
};

const compile = (contentType: string, node: SegmentNode, timeZone?: string) => {
  const fields = SALES_SEGMENT_FIELDS[contentType];

  if (!fields) {
    return null;
  }

  return compileSegmentMongoFilter(node, { fields, timeZone });
};

export const listDealSegmentMembers = async (
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
  const collection = pagedCollection(models, contentType);
  const compiled = compile(contentType, node, timeZone);

  if (!collection || !compiled) {
    return { ids: [], unsupported: [contentType] };
  }

  const size = segmentPageSize(limit);

  const records = await collection
    .find(segmentPageFilter(compiled.filter, { cursor, ids }), { _id: 1 })
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

export const countDealSegmentMembers = async (
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
  const collection = pagedCollection(models, contentType);
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
