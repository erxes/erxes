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
import { FRONTLINE_SEGMENT_FIELDS, TICKET_TYPE } from './fields';

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

const compile = (contentType: string, node: SegmentNode, timeZone?: string) => {
  const fields = FRONTLINE_SEGMENT_FIELDS[contentType];

  return fields ? compileSegmentMongoFilter(node, { fields, timeZone }) : null;
};

export const listTicketSegmentMembers = async (
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
  const compiled = compile(contentType, node, timeZone);

  if (!compiled) {
    return { ids: [], unsupported: [contentType] };
  }

  const collection = models.Ticket as unknown as PagedCollection;
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

export const countTicketSegmentMembers = async (
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
  const compiled = compile(contentType, node, timeZone);

  if (!compiled) {
    return { count: 0, unsupported: [contentType] };
  }

  const collection = models.Ticket as unknown as PagedCollection;

  const count = await collection.countDocuments(
    segmentPageFilter(compiled.filter, { ids }),
  );

  return compiled.unsupported.length
    ? { count, unsupported: compiled.unsupported }
    : { count };
};

export { TICKET_TYPE };
