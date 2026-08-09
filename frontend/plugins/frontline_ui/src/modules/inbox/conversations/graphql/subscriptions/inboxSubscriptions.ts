import { gql } from '@apollo/client';
import { ATTACHMENT_GQL } from 'erxes-ui';
import messageFields from './messageFields';

export const conversationChanged = gql`
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

export const conversationMessageInserted = gql`
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;
export const CONVERSATION_CHANGED = gql`
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

export const CONVERSATION_MESSAGE_INSERTED = gql`
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      _id
      conversationId
      content
      formWidgetData
      extraData
      ${ATTACHMENT_GQL}
      internal
      fromBot
      createdAt
      isCustomerRead
      userId
      customerId
      botData
      source
      fromBot
    }
  }
`;

export const CONVERSATION_CLIENT_MESSAGE_INSERTED = gql`
  subscription conversationClientMessageInserted($userId: String!) {
    conversationClientMessageInserted(userId: $userId) {
      _id
      conversationId
      content
      createdAt
    }
  }
`;

export const CONVERSATION_CLIENT_TYPING_STATUS_CHANGED = gql`
  subscription conversationClientTypingStatusChanged($_id: String!) {
    conversationClientTypingStatusChanged(_id: $_id) {
      conversationId
      customerId
      customerName
      text
    }
  }
`;

export const CONVERSATION_EXTERNAL_INTEGRATION_MESSAGE_INSERTED = gql`
  subscription conversationExternalIntegrationMessageInserted {
    conversationExternalIntegrationMessageInserted
  }
`;

const customerConnectionChanged = `
  subscription customerConnectionChanged ($_id: String!) {
    customerConnectionChanged (_id: $_id) {
      _id
      status
    }
  }
`;

export default {
  conversationChanged,
  conversationMessageInserted,
  conversationClientTypingStatusChanged:
    CONVERSATION_CLIENT_TYPING_STATUS_CHANGED,
  customerConnectionChanged,
};
