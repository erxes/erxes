import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type PackageProduct {
    productId: String!
    quantity: Int!
    product: Product
  }

  type ProductPackage {
    _id: String!
    name: String
    description: String
    coverImage: String

    products: [PackageProduct]

    tagIds: [String]
    tags: [Tag]

    price: Float
    percent: Float
    totalPrice: Float

    status: String
    createdAt: Date
    updatedAt: Date
  }

  type ProductPackagesListResponse {
    list: [ProductPackage]
    pageInfo: PageInfo
    totalCount: Int
  }

  input ProductPackageInput {
    productId: String!
    quantity: Int!
  }
`;

const queryParams = `
  searchValue: String
  status: String
  ids: [String]
  tagIds: [String]
`;

export const queries = `
  productPackages(${queryParams}${GQL_CURSOR_PARAM_DEFS}): ProductPackagesListResponse
  productPackageDetail(_id: String!): ProductPackage
`;

const mutationParams = `
  name: String
  description: String
  coverImage: String
  products: [ProductPackageInput!]
  tagIds: [String]
  price: Float
  percent: Float
  status: String
`;

export const mutations = `
  productPackagesAdd(${mutationParams}): ProductPackage
  productPackagesEdit(_id: String!, ${mutationParams}): ProductPackage
  productPackagesChangeStatus(_ids: [String!]!, status: String!): [ProductPackage]
  productPackagesRemove(_ids: [String!]!): JSON
`;
