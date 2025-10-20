export const types = `
  type Spin {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getSpin(_id: String!): Spin
  getSpins: [Spin]
`;

export const mutations = `
  createSpin(name: String!): Spin
  updateSpin(_id: String!, name: String!): Spin
  removeSpin(_id: String!): Spin
`;
