export default `
  _id
  content
  attachments
  mentionedUserIds
  conversationId
  internal
  customerId
  userId
  createdAt
  isCustomerRead
  engageData {
    messageId
    brandId
    content
    fromUserId
    kind
    sentAs
  }
  formWidgetData
  twitterData
  facebookData
  user {
    _id
    username
    details {
      avatar
      fullName
      position
      twitterUsername
    }
  }
  customer {
    _id
    firstName
    lastName
    email
    phone
    isUser
    companies {
      _id
      name
      website
    }

    getMessengerCustomData
    customFieldsData
    messengerData
    twitterData
    facebookData

    tagIds
    getTags {
      _id
      name
      colorCode
    }
  }
`;
