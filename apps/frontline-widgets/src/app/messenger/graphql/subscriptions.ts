import { gql } from '@apollo/client';
import { messageFields } from './fields';

const ConversationMessageInserted = gql`
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

const conversationBotTypingStatus = `
  subscription conversationBotTypingStatus($_id: String!) {
    conversationBotTypingStatus(_id: $_id)
  }
`;

const conversationAdminTypingStatusChanged = `
  subscription conversationAdminTypingStatusChanged($_id: String!) {
    conversationAdminTypingStatusChanged(_id: $_id) {
      text
    }
  }
`;

export {
  ConversationMessageInserted,
  conversationBotTypingStatus,
  conversationAdminTypingStatusChanged,
};
