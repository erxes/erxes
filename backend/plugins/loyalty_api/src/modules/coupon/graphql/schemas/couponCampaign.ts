export const types = `
  enum CouponKind {
    amount
    percent
  }

  type CouponCampaign {
    _id: String
    name: String
    description: String
    status: String

    kind: CouponKind
    value: Float
    codeRule: JSON
    restrictions: JSON
    redemptionLimitPerUser: Int
    buyScore: Int

    createdAt: String
    updatedAt: String
    createdBy: String
    updatedBy: String
  }
`;
const queryParams = `
  status: String
  searchValue: String
`;
export const queries = `
  getCouponCampaigns(${queryParams}): [CouponCampaign]
  getCouponCampaignDetail(_id: String!): CouponCampaign
`;
const mutationParams = `
  name: String
  description: String
  status: String

  kind: CouponKind
  value: Float
  codeRule: JSON
  restrictions: JSON
  redemptionLimitPerUser: Int
  buyScore: Int
`;
export const mutations = `
  createCouponCampaign(${mutationParams}): CouponCampaign
  updateCouponCampaign(_id: String!, ${mutationParams}): CouponCampaign
  removeCouponCampaign(_id: String!): CouponCampaign
`;
