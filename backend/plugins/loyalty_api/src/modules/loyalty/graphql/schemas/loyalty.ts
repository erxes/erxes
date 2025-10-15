export const types = `
  type Loyalty {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getLoyalty(_id: String!): Loyalty
  getLoyaltys: [Loyalty]
`;

export const mutations = `
  createLoyalty(name: String!): Loyalty
  updateLoyalty(_id: String!, name: String!): Loyalty
  removeLoyalty(_id: String!): Loyalty
`;
