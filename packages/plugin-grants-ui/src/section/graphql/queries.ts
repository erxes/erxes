const grantRequest = `
query GrantRequest($cardId: String, $cardType: String) {
  grantRequest(cardId: $cardId, cardType: $cardType) {
    action
    userIds
    params
    requesterId

    users {
      _id
      grantResponse
      email
      username
      details {
        avatar
        fullName
        firstName
        middleName
        lastName
      }
    }
  }
}
`;

const grantActions = `
query GetGrantRequestActions {
  getGrantRequestActions {
    action
    label
    scope
  }
}
`;

export default { grantRequest, grantActions };
