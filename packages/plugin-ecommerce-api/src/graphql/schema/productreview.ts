export const types = `
  type Productreview {
    _id: String!
    productId: String!
    customerId : String
    review: Float
    description: String
    info: JSON
  }
  type AverageReview {
    productId: String
    average: Float
    length: Int
  }
`;

const mutationParams = `
    productId: String,
    customerId : String,
    review: Float,
    description: String,
    info: JSON
`;

export const queries = `
  productreview(productId: String!): AverageReview
  productreviews(productIds: [String], customerId : String):[Productreview]
`;

export const mutations = `
  productreviewAdd(${mutationParams}): Productreview
  productreviewUpdate(_id: String!, ${mutationParams}): Productreview
  productreviewRemove(_id: String!): Productreview
`;
