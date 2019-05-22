export const types = `
  type Product {
    _id: String!
    name: String
    type: String
    description: String
    sku: String
    createdAt: Date
  }
`;

const params = `
  name: String!,
  type: String,
  description: String,
  sku: String,
`;

export const queries = `
  products(type: String, searchValue: String, page: Int, perPage: Int ids: [String]): [Product]
  productsTotalCount(type: String): Int
`;

export const mutations = `
  productsAdd(${params}): Product
  productsEdit(_id: String!, ${params}): Product
  productsRemove(_id: String!): JSON
`;
