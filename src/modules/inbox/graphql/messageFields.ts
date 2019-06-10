export default `
  _id
  content
  attachments {
    url
    name
    size
    type
  }
  mentionedUserIds
  conversationId
  internal
  fromBot
  customerId
  userId
  createdAt
  isCustomerRead
  formWidgetData
  messengerAppData
  user {
    _id
    username
    details {
      avatar
      fullName
      position
    }
  }
  customer {
    _id
    avatar
    firstName
    lastName
    primaryEmail
    primaryPhone
    isUser
    companies {
      _id
      primaryName
      website
    }

    getMessengerCustomData
    customFieldsData
    messengerData

    tagIds
    getTags {
      _id
      name
      colorCode
    }
  }
`;
