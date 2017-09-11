export default `query conversationDetail($_id: String!) {
  conversationDetail(_id: $_id) {
    _id
    status
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
      formWidgetData
      engageData
      facebookData
    }
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
  }
}`;
