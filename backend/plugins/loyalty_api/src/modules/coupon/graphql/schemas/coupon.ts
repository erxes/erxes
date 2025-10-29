import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Coupon {
    _id: String
    name: String
    description: String
    code: String
    owner: Owner
    ownerType: String
    campaignId: String
    conditions: String
    status: String
    createdAt: String
    updatedAt: String
    createdBy: User
    updatedBy: User
  }

  type CouponListResponse {
    list: [Coupon]
    pageInfo: PageInfo
    totalCount: Float
  }
`;

const queryParams = `
  searchValue: String
  status: String
  fromDate: String
  toDate: String
  dateField: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  getCoupon(_id: String!): Coupon
  getCoupons(${queryParams}): CouponListResponse
`;

const mutationParams = `
  name: String!
  description: String
  ownerId: String
  ownerType: String
  campaignId: String
  conditions: JSON
  status: String
`;

export const mutations = `
  createCoupon(${mutationParams}): Coupon
  updateCoupon(_id: String!, ${mutationParams}): Coupon
  removeCoupon(_id: String!): Coupon
`;
