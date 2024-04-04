export const types = `
  type Package {
    _id: String!
    name: String
    description: String
    wpId: String
    level: String
    projectWpId: String
    projectId: String
    price: Float
    duration: Float
    profit: Float
    createdAt: Date
    modifiedAt: Date
  }
`;

export const conformityQueryFields = `
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

const queryParams = `
  page: Int
  perPage: Int
  type: String
  searchValue: String
  level: String
  ${conformityQueryFields}
`;

export const queries = `
  packages(${queryParams}): [Package]
  packageDetail(_id: String!): Package
  packageCounts(${queryParams}, only: String): JSON
`;

const packageParams = `
  name: String
  description: String
  wpId: String
  level: String
  projectWpId: String
  projectId: String
  price: Float
  duration: Float
  profit: Float
`;

export const mutations = `
  packagesAdd(${packageParams}): Package
  packagesEdit(_id: String!, ${packageParams}): Package
  packagesRemove(_id: String!): String
`;
