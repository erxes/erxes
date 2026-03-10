export const types = `
  type ProductReview {
    _id: String!
    productId: String!
    customerId: String
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
  customerId: String,
  review: Float,
  description: String,
  info: JSON
`;

export const queries = `
  productReview(productId: String!): AverageReview
  productReviews(
    productIds: [String]
    customerId: String
    page: Int
    perPage: Int
  ): [ProductReview]
`;

export const mutations = `
  productReviewAdd(${mutationParams}): ProductReview
  productReviewUpdate(_id: String!, ${mutationParams}): ProductReview
  productReviewRemove(_id: String!): ProductReview
`;
