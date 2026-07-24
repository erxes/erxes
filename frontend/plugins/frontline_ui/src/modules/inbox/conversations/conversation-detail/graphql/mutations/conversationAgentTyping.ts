import { gql } from '@apollo/client';

// Relays the agent's "is typing…" presence to the conversation's channel. The
// backend routes it per-integration; only Discord acts on it today (others
// no-op), so the composer can call this generically.
export const CONVERSATION_AGENT_TYPING = gql`
  mutation ConversationAgentTyping($conversationId: String!, $typing: Boolean) {
    conversationAgentTyping(conversationId: $conversationId, typing: $typing)
  }
`;
