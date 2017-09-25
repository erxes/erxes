const messageFields = `
  _id
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
  }
  attachments{
    url
    name
    size
    type
  }
`;


const conversationDetailQuery = `
  query ($conversationId: String!, $integrationId: String!) {
    messages(conversationId: $conversationId) {
      ${messageFields}
    }

    conversationLastStaff(_id: $conversationId) {
      _id,
      details {
        avatar
        fullName
      }
    }

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
  unreadCountQuery,
  conversationMessageInserted,
  conversationsChangedSubscription,
}
