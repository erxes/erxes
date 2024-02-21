export const types = `
  type PromoCode {
    _id: String!
    code: String!
    status: String
  }
`;

export const mutations = `
  usePromoCode(code: String!): PromoCode
`;
