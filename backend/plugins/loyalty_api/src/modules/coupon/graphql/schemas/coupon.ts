import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Coupon {
    _id: String
    code: String
    campaignId: String
    campaign: CouponCampaign
    ownerType: String
    ownerId: String
    status: String
    usageLimit: Int
    usageCount: Int
    redemptionLimitPerUser: Int
    createdAt: String
    updatedAt: String
  }

  type CouponListResponse {
    list: [Coupon]
    pageInfo: PageInfo
    totalCount: Int
  }

  type OwnerCoupon {
    campaign: CouponCampaign,
    coupons: [Coupon],
    count: Int
  }
`;

const queryParams = `
  searchValue: String
  campaignId: String
  ownerType: String
  ownerId: String
  status: String
  fromDate: String
  toDate: String
  dateField: String
  sortField: String
  sortDirection: Int

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  coupons(${queryParams}): CouponListResponse
  couponsByOwner(ownerId: String!, status: String): [OwnerCoupon]
`;

export const mutations = `
  couponAdd(campaignId: String!): [Coupon]
  couponEdit(_id: String!, status: String, usageLimit: Int, redemptionLimitPerUser: Int): Coupon
  couponsRemove(_ids: [String]): JSON
`;
