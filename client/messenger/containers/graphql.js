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
  query ($conversationId: String!) {
    conversationDetail(_id: $conversationId) {
      _id
      content
      messages {
        ${messageFields}
      }
    }
  }
`;

const conversationLastStaffQuery = `
  query ($conversationId: String!) {
    conversationLastStaff(_id: $conversationId) {
      _id,
      details {
        avatar
        fullName
      }
    }
  }
`;

const isMessengerOnlineQuery = `
  query ($integrationId: String!) {
    isMessengerOnline(integrationId: $integrationId)
  }
`;

const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      ${messageFields}
    }
  }
`;

const unreadCountQuery = `
  query unreadCount($conversationId: String) {
    unreadCount(conversationId: $conversationId)
  }
`;

const conversationsChangedSubscription = `
  subscription conversationsChanged($customerId: String) {
    conversationsChanged(customerId: $customerId) {
      type
    }
  }
`;

export default {
  messageFields,
  conversationDetailQuery,
  conversationLastStaffQuery,
  isMessengerOnlineQuery,
  unreadCountQuery,
  conversationMessageInserted,
  conversationsChangedSubscription,
}
