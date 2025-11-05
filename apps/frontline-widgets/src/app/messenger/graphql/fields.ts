const USER_DETAIL_FIELD = `
  avatar
  fullName
`;

const MESSAGE_FIELDS = `
  _id
  conversationId
  customerId
  user {
    _id
    details {
      ${USER_DETAIL_FIELD}
    }
  }
  content
  createdAt
  internal
  fromBot
  contentType

  engageData {
    content
    kind
    sentAs
    messageId
    brandId
  }
  botData
  messengerAppData
  attachments {
    url
    name
    size
    type
  }
`;

const messageFields = `
  _id
  conversationId
  customerId
  user {
    _id
    details {
      avatar
      fullName
      description
      location
      position
      shortName
    }
  }
  content
  createdAt
  internal
  fromBot
  contentType

  engageData {
    content
    kind
    sentAs
    messageId
    brandId
  }
  botData
  messengerAppData
  attachments {
    url
    name
    size
    type
  }
`;

export { messageFields, USER_DETAIL_FIELD, MESSAGE_FIELDS };
