import messageFields from './messageFields.js';

export const conversationUpdated = `
  subscription onConversationUpdated($conversationId: String!) {
    conversationUpdated(conversationId: $conversationId) {
      type
      message {
        ${messageFields}
      }
    }
  }
`;

export const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

export const conversationsChanged = `
  subscription conversationsChanged {
    conversationsChanged
  }
`;
