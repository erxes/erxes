export default `
  _id
  content
  status
  assignedUserId
  createdAt
  assignedUser {
    _id
    username
    details {
      avatar
      fullName
      position
      twitterUsername
    }
  }
  integration {
    _id
    kind
    brandId,
    brand {
      _id
      name
    }
    channels {
      _id
      name
    }
  }
  customer {
    _id
    firstName
    lastName
    email
    phone
    isUser
    integrationId
    createdAt
    companies {
      _id
      name
      website
    }

    visitorContactInfo
    getMessengerCustomData
    customFieldsData
    messengerData
    twitterData
    facebookData
    remoteAddress
    location
    tagIds
    getTags {
      _id
      name
      colorCode
    }
  }
  messageCount
  participatorCount
  participatedUserIds
  participatedUsers {
    _id
    username
    details {
      avatar
      fullName
      position
      twitterUsername
    }
  }
  tagIds
  tags {
    _id
    name
    colorCode
  }
  twitterData
  facebookData
  readUserIds
`;
