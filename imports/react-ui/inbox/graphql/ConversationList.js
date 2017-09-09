export default `query objects($params: ConversationListParams) {
  conversations(params: $params) {
    _id
    content
    createdAt
    participatorCount
    readUserIds
    participatedUserIds
    tags {
      _id
      name
    }
    customer {
      _id
      name
    }
    integration {
      _id
      name
      kind

      brand {
        _id
        name
      }
    }
  }
}`;
