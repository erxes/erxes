import {
  SegmentMembershipCollection,
  SegmentOwnedSource,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { CONVERSATION_TYPE, MESSAGE_TYPE } from './fields';

/**
 * Which collection backs each content type this module owns.
 *
 * Messages are here without being a segment subject: a relation into them is
 * measured against this collection, and only membership is limited to the
 * conversation.
 */

type InboxCollection = {
  countDocuments: (filter: Record<string, unknown>) => Promise<number>;
  find: (
    query: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => {
    lean: () => Promise<Record<string, unknown>[]>;
    sort: (order: Record<string, 1>) => {
      limit: (count: number) => { lean: () => Promise<{ _id: string }[]> };
    };
  };
  aggregate: (
    pipeline: Record<string, unknown>[],
  ) => Promise<Record<string, unknown>[]>;
};

export const inboxCollection = (
  models: IModels,
  contentType: string,
): InboxCollection | null => {
  const as = (model: unknown) => model as InboxCollection;

  if (contentType === CONVERSATION_TYPE) {
    return as(models.Conversations);
  }

  if (contentType === MESSAGE_TYPE) {
    return as(models.ConversationMessages);
  }

  return null;
};

export const inboxSegmentSource = (
  models: IModels,
  contentType: string,
): SegmentOwnedSource | null => {
  const collection = inboxCollection(models, contentType);

  if (!collection) {
    return null;
  }

  return {
    find: (query, projection) => collection.find(query, projection).lean(),
    aggregate: (pipeline) => collection.aggregate(pipeline),
  };
};

/**
 * Only the conversation is materialised. A message is never a member of
 * anything, so writing membership onto one would be state nobody reads.
 */
export const inboxMembershipCollections = (
  models: IModels,
): Record<string, SegmentMembershipCollection> => ({
  [CONVERSATION_TYPE]:
    models.Conversations as unknown as SegmentMembershipCollection,
});
