const grantRequest = `
query GrantRequest($cardId: String, $cardType: String) {
  grantRequest(cardId: $cardId, cardType: $cardType) {
    action
    userIds
  }
}
`;

const grantActions = `
query GetGrantRequestActions {
  getGrantRequestActions {
    action
    label
  }
}
`;

export default { grantRequest, grantActions };
