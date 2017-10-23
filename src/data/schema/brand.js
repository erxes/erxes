export const types = `
  type Brand {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    emailConfig: JSON
  }
`;

export const queries = `
  brands(limit: Int): [Brand]
  brandDetail(_id: String!): Brand
  brandsTotalCount: Int
`;

export const mutations = `
  brandsAdd(name: String, description: String): Brand
  brandsEdit(_id: String!, name: String, description: String): Brand
  brandsRemove(_id: String!): String
  brandsConfigEmail(_id: String!, emailConfig: JSON): Brand
`;
