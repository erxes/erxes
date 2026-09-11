export const types = `
  type ProductPlacesResponse {
    userId: String!
    responseId: String!
    sessionCode: String!
    content: JSON
  }
`;

export const subscriptions = `
  extend type Subscription {
    productPlacesResponded(userId: String, sessionCode: String): ProductPlacesResponse!
  }
`;
