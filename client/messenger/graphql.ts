import { connection } from "./connection";

const messageFields = `
  _id
  conversationId
  user {
    _id
    details {
      avatar
      fullName
    }
  }
  content
  createdAt
  internal
  engageData {
    content
    kind
    sentAs
    fromUser {
      details {
        fullName
        avatar
      }
    }
    messageId
    brandId
  }
  attachments
`;

const conversationDetailQuery = `
  query ($_id: String, $integrationId: String!) {
    conversationDetail(_id: $_id, integrationId: $integrationId) {
      messages {
        ${messageFields}
      }

      isOnline
      supporters {
        _id
        details {
          avatar
          fullName
        }
      }
    }
  }
`;

const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

const adminMessageInserted = `
  subscription conversationAdminMessageInserted($customerId: String!) {
    conversationAdminMessageInserted(customerId: $customerId) {
      _id
    }
  }
`;

const unreadCountQuery = `
  query unreadCount($conversationId: String) {
    unreadCount(conversationId: $conversationId)
  }
`;

const totalUnreadCountQuery = `
  query totalUnreadCount(${connection.queryVariables}) {
    totalUnreadCount(${connection.queryParams})
  }
`;

const conversationChanged = `
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

const allConversations = `
  query allConversations(${connection.queryVariables}) {
    conversations(${connection.queryParams}) {
      _id
      content
      createdAt
      participatedUsers {
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const readConversationMessages = `
  mutation readConversationMessages($conversationId: String) {
    readConversationMessages(conversationId: $conversationId)
  }
`;

const connect = `
  mutation connect($brandCode: String!, $email: String, $phone: String,
    $isUser: Boolean, $data: JSON,
    $companyData: JSON, $cachedCustomerId: String) {
    messengerConnect(brandCode: $brandCode, email: $email, phone: $phone,
      isUser: $isUser, data: $data, companyData: $companyData,
      cachedCustomerId: $cachedCustomerId) {
      integrationId,
      messengerData,
      languageCode,
      uiOptions,
      customerId,
    }
  }
`;

const saveBrowserInfo = `
  mutation saveBrowserInfo($customerId: String!  $browserInfo: JSON!) {
    saveBrowserInfo(customerId: $customerId browserInfo: $browserInfo) {
      ${messageFields}
    }
  }
`;

export default {
  messageFields,
  conversationDetailQuery,
  unreadCountQuery,
  totalUnreadCountQuery,
  conversationMessageInserted,
  adminMessageInserted,
  conversationChanged,
  allConversations,
  connect,
  saveBrowserInfo,
  readConversationMessages
};
