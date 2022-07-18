export const types = `
  type Productreview {
    _id: String!
    productId: String!
    customerIds : [String]
    review: Int
    count: Int
  }
`;

const params = `
    productId: String!,
`;
export const queries = `
  productreviews(${params}): [Productreview]
  productreviewsTotalCount: Int
`;

export const mutations = `
  productreviewsAdd(${params}): Productreview
`;
