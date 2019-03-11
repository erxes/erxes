export const types = `
  type Brand {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    emailConfig: JSON

    integrations: [Integration]
  }
`;

export const queries = `
  brands(page: Int, perPage: Int): [Brand]
  brandDetail(_id: String!): Brand
  brandsTotalCount: Int
  brandsGetLast: Brand
`;

export const mutations = `
  brandsAdd(name: String!, description: String): Brand
  brandsEdit(_id: String!, name: String!, description: String): Brand
  brandsRemove(_id: String!): JSON
  brandsConfigEmail(_id: String!, emailConfig: JSON): Brand
  brandsManageIntegrations(_id: String!, integrationIds: [String]!): [Integration]
`;
