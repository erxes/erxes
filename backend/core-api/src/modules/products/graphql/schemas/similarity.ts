export const types = `
  type ProductSimilarityField {
    fieldId: String
    text: String
    values: [String]
  }

  type ProductBulkSimilarity {
    _id: String!
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
  productBulkSimilarity(_id: String!): ProductBulkSimilarity
  productBulkSimilarities(page: Int, perPage: Int, searchValue: String): [ProductBulkSimilarity]
  productBulkSimilaritiesTotalCount(searchValue: String): Int
`;

export const mutations = `
  productBulkSimilarityAdd(doc: JSON!): ProductBulkSimilarity
  productBulkSimilarityEdit(_id: String!, doc: JSON!): ProductBulkSimilarity
  productBulkSimilarityRemove(_id: String!): String
`;
