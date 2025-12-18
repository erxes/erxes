export const types = `
  type Insurance {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getInsurance(_id: String!): Insurance
  getInsurances: [Insurance]
`;

export const mutations = `
  createInsurance(name: String!): Insurance
  updateInsurance(_id: String!, name: String!): Insurance
  removeInsurance(_id: String!): Insurance
`;
