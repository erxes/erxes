export const types = `
  type Donate {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getDonate(_id: String!): Donate
  getDonates: [Donate]
`;

export const mutations = `
  createDonate(name: String!): Donate
  updateDonate(_id: String!, name: String!): Donate
  removeDonate(_id: String!): Donate
`;
