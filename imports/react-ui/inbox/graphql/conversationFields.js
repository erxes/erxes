export default `
  _id
  content
  status
  assignedUserId
  assignedUser {
    _id
    username
    details
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
    name
    getMessengerCustomData
  }
  messageCount
  participatorCount
  participatedUsers {
    _id
    username
    details
  }
  tags {
    _id
    name
    colorCode
  }
  facebookData
  readUserIds
`;
