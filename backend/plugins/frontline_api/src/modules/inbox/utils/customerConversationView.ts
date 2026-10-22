import type { IConversationDocument } from '@/inbox/@types/conversations';

export const toCustomerConversationView = (
  conversation: IConversationDocument,
) => ({
  ...(typeof conversation.toObject === 'function'
    ? conversation.toObject<IConversationDocument>()
    : conversation),
  customerView: true,
});
