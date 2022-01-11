export const types = `
  type Brand @key(fields: "_id") {
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
  allBrands: [Brand]
  brands(page: Int, perPage: Int, searchValue: String): [Brand]
  brandDetail(_id: String!): Brand
  brandsTotalCount: Int
  brandsGetLast: Brand
`;

const mutationParams = `
  name: String!
  description: String
  emailConfig: JSON
`;

export const mutations = `
  brandsAdd(${mutationParams}): Brand
  brandsEdit(_id: String! ${mutationParams}): Brand
  brandsRemove(_id: String!): JSON
`;
