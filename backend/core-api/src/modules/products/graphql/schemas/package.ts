import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type PackageProduct {
    productId: String!
    quantity: Int!
    product: Product
  }

  type Package {
    _id: String!
    name: String
    description: String
    coverImage: String

    products: [PackageProduct]

    price: Float
    percent: Float
    componentsTotal: Float

    status: String
    createdAt: Date
    updatedAt: Date
  }

  type PackagesListResponse {
    list: [Package]
    pageInfo: PageInfo
    totalCount: Int
  }

  input PackageProductInput {
    productId: String!
    quantity: Int!
  }
`;

const queryParams = `
  searchValue: String
  status: String
  ids: [String]
`;

export const queries = `
  packages(${queryParams}${GQL_CURSOR_PARAM_DEFS}): PackagesListResponse
  packageDetail(_id: String!): Package
`;

const mutationParams = `
  name: String
  description: String
  coverImage: String
  products: [PackageProductInput!]
  price: Float
  percent: Float
  status: String
`;

export const mutations = `
  packagesAdd(${mutationParams}): Package
  packagesEdit(_id: String!, ${mutationParams}): Package
  packagesChangeStatus(_ids: [String!]!, status: String!): [Package]
  packagesRemove(_ids: [String!]!): JSON
`;
