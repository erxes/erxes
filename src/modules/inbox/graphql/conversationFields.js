export default `
  _id
  content
  status
  assignedUserId
  createdAt
  updatedAt
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

    owner {
      details {
        fullName
      }
    }
    position
    department
    leadStatus
    lifecycleState
    hasAuthority
    description
    doNotDisturb
    links {
      linkedIn
      twitter
      facebook
      youtube
      github
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
  twitterData {
    id_str
    isDirectMessage
  }
  facebookData {
    kind
  }
  readUserIds
`;
