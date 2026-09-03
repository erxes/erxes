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
import { taskCollection } from './collections';
import { TASK_SEGMENT_FIELD_MAP } from './fields';

const compile = (contentType: string, node: SegmentNode, timeZone?: string) => {
  const fields = TASK_SEGMENT_FIELD_MAP[contentType];

  return fields ? compileSegmentMongoFilter(node, { fields, timeZone }) : null;
};

export const listTaskSegmentMembers = async (
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
  const collection = taskCollection(models, contentType);
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

export const countTaskSegmentMembers = async (
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
  const collection = taskCollection(models, contentType);
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
