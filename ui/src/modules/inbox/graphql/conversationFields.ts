export default `
  _id
  content
  status
  assignedUserId
  createdAt
  updatedAt
  operatorStatus
  assignedUser {
    _id
    username
    details {
      avatar
      fullName
      position
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
  customerId
  customer {
    _id
    visitorContactInfo
    trackedData
    isOnline
    avatar
    firstName
    lastName
    emails
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
    }
  }
  tagIds
  tags {
    _id
    name
    colorCode
  }
  videoCallData {
    url
    name
  }
  readUserIds
  callProAudio
  facebookPost {
    postId
    recipientId
    senderId
    content
    erxesApiId
    attachments
    timestamp
    permalink_url
  }
  isFacebookTaggedMessage
  customFieldsData
`;
