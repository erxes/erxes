export const types = `
  type Productreview {
    _id: String!
    productId: String!
    customerId : String
    review: String
  }
`;

const queryParams = `
    productId: String!,
`;

const mutationParams = `
    productId: String!,
    customerId : String,
    review: String
`;

export const queries = `
  productreviews(${queryParams}): [Productreview]
`;

export const mutations = `
  productreviewsAdd(${mutationParams}): Productreview
  productreviewsCountAdd(${mutationParams}): Productreview
`;
