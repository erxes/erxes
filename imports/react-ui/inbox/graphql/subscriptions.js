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

export const conversationNotification = `
  subscription conversationNotification {
    conversationNotification
  }
`;
