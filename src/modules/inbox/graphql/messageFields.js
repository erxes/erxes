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
  engageData
  formWidgetData
  facebookData
  user {
    _id
    username
    details
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
