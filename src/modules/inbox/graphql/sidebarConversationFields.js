const sidebarConversationFields = `
  _id
  content
  updatedAt
  assignedUser {
    _id
    details {
      avatar
    }
  }
  integration {
    _id
    kind
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
  }
  readUserIds
`;

export default sidebarConversationFields;
