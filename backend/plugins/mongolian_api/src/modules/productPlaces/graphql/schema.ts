export const types = `
  type PData {
    productId: ID
    amount: Float
  }

  type ProductPlacesContent {
    branchId: ID
    departmentId: ID
    date: String
    name: String
    number: String
    customerCode: String
    customerName: String
    pDatas: [PData!]
    amount: Float
    headerText: String
    footerText: String
  }

  type ProductPlacesResponse {
    userId: String!
    responseId: String!
    sessionCode: String!
    content: [ProductPlacesContent!]!
  }
`;

export const subscriptions = `
  extend type Subscription {
    productPlacesResponded(userId: String!, sessionCode: String!): ProductPlacesResponse!
  }
`;