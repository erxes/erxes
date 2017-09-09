export default `query conversationDetail($_id: String!) {
  conversationDetail(_id: $_id) {
    _id
    status
    assignedUser {
      _id
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
    messages {
      _id
      content
      user {
        _id
        username
        details
      }
      customer {
        _id
        name
      }
    }
    participatedUsers {
      _id
      details
    }
    tags {
      _id
      name
      color
    }
  }
}`;
