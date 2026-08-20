import type { IConversation } from '@/inbox/types/Conversation';

export const getBooleanFilterVariable = (
  value: boolean | null | undefined,
): string | undefined => (value ? 'true' : undefined);

export const getConversationRecency = (conversation: IConversation) => {
  const time = Date.parse(conversation.updatedAt || conversation.createdAt);

  return Number.isNaN(time) ? 0 : time;
};

// Live cache writes only patch fields, so re-apply the server's order
// (updatedAt desc, ascending _id) to keep the newest conversation on top.
export const compareConversationsByRecency = (
  first: IConversation,
  second: IConversation,
) =>
  getConversationRecency(second) - getConversationRecency(first) ||
  first._id.localeCompare(second._id);
