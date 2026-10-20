import { TAiMemoryScope } from 'erxes-api-shared/core-modules';

const toId = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : '';

// What an AI agent's long-term memory is filed under: this conversation, and
// the customer across all of their conversations.
export const toAiMemoryScopes = ({
  conversationType,
  conversationId,
  customerId,
}: {
  conversationType: string;
  conversationId: unknown;
  customerId: unknown;
}): TAiMemoryScope[] =>
  [
    { type: conversationType, id: toId(conversationId) },
    { type: 'core:customer', id: toId(customerId) },
  ].filter(({ id }) => !!id);
