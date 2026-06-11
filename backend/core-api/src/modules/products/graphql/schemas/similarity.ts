export const types = `
  type ProductSimilarityField {
    fieldId: String
    text: String
    values: [String]
  }

  type ProductSimilarity {
    _id: String!
    title: String
    status: String
    info: JSON
    propertiesData: JSON
    productIds: [String]
    starProductId: String
    products: [Product]
    fields: [ProductSimilarityField]
    createdAt: Date
    updatedAt: Date
  }
`;

export const queries = `
  productSimilarity(_id: String!): ProductSimilarity
  productSimilarities(page: Int, perPage: Int, searchValue: String): [ProductSimilarity]
  productSimilaritiesTotalCount(searchValue: String): Int
`;

export const mutations = `
  productSimilarityBulkSave(_id: String, doc: JSON!): ProductSimilarity
  productSimilarityRemove(_id: String!): String
  productSimilaritySetStar(_id: String!, productId: String!): ProductSimilarity
`;
