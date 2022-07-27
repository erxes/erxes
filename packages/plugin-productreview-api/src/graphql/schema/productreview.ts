export const types = `
  type Productreview {
    _id: String!
    productId: String!
    customerId : String
    review: Int 
  }
`;

const queryParams = `
    productId: String!,
`;

const mutationParams = `
    productId: String,
    customerId : String,
    review: Int 
`;

export const queries = `
  productreviews(${queryParams}): [Productreview]
`;

export const mutations = `
  productreviewAdd(${mutationParams}): Productreview
  productreviewUpdate(_id: String!, ${mutationParams}): Productreview
  productreviewRemove(_id: String!): Productreview
`;
