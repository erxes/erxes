import messageFields from './messageFields.js';

export const changeConversationStatus = `
  mutation changeConversationStatus($_id: String!) {
    changeConversationStatus(_id: $_id)
  }
`;

export const assignConversations = `
  mutation assignConversations($_ids: [String]!) {
    assignConversations(_ids: $_ids)
  }
`;

export const sendMessage = `
  mutation sendMessage($messageId: String!) {
    insertMessage(messageId: $messageId) {
      ${messageFields}
    }
  }
`;
