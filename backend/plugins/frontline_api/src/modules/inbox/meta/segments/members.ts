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
import { inboxCollection } from './collections';
import { resolveIntegrationKindNode } from './derived';
import { CONVERSATION_TYPE, INBOX_SEGMENT_FIELDS } from './fields';

/**
 * Runs a segment against the conversation collection.
 *
 * Only conversations are listed: a message is never a member of anything, so
 * asking for one is a caller mistake rather than an empty result.
 */

const compile = async (
  models: IModels,
  contentType: string,
  node: SegmentNode,
  timeZone?: string,
) => {
  if (contentType !== CONVERSATION_TYPE) {
    return null;
  }

  return compileSegmentMongoFilter(
    await resolveIntegrationKindNode(models, node),
    { fields: INBOX_SEGMENT_FIELDS[contentType], timeZone },
  );
};

export const listInboxSegmentMembers = async (
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
  const collection = inboxCollection(models, contentType);
  const compiled = await compile(models, contentType, node, timeZone);

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

export const countInboxSegmentMembers = async (
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
  const collection = inboxCollection(models, contentType);
  const compiled = await compile(models, contentType, node, timeZone);

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
