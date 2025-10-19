export const types = `
  type Coupon {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getCoupon(_id: String!): Coupon
  getCoupons: [Coupon]
`;

export const mutations = `
  createCoupon(name: String!): Coupon
  updateCoupon(_id: String!, name: String!): Coupon
  removeCoupon(_id: String!): Coupon
`;
