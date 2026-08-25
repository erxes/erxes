import { gql } from '@apollo/client';
import { ATTACHMENT_GQL } from 'erxes-ui';

const MESSAGE_ACTION_FIELDS = `
  _id
  content
  conversationId
  internal
  userId
  customerId
  createdAt
  isCustomerRead
  replyToMessageId
  pinnedByIds
  editedAt
  deletedAt
  ${ATTACHMENT_GQL}
`;

export const FRONTLINE_CONVERSATION_MESSAGE_EDIT = gql`
  mutation FrontlineConversationMessageEdit(
    $_id: String!
    $content: String
  ) {
    conversationMessageEdit(_id: $_id, content: $content) {
      ${MESSAGE_ACTION_FIELDS}
    }
  }
`;

export const FRONTLINE_CONVERSATION_MESSAGE_REMOVE = gql`
  mutation FrontlineConversationMessageRemove($_id: String!) {
    conversationMessageRemove(_id: $_id) {
      ${MESSAGE_ACTION_FIELDS}
    }
  }
`;

export const FRONTLINE_CONVERSATION_MESSAGE_PIN_TOGGLE = gql`
  mutation FrontlineConversationMessagePinToggle($_id: String!) {
    conversationMessagePinToggle(_id: $_id) {
      ${MESSAGE_ACTION_FIELDS}
    }
  }
`;
