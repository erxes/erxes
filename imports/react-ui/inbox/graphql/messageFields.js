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
    name
  }
`;
