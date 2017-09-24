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
  totalBrandsCount: Int
`;
