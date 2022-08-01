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
    productId: String!,
    customerId : String,
    review: Int 
`;

export const queries = `
  productreviews(${queryParams}): [Productreview]
`;

export const mutations = `
  productreviewsAdd(${mutationParams}): Productreview
  productreviewsCountAdd(${mutationParams}): Productreview
`;
