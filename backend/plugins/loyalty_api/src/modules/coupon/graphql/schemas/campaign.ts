import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type CouponCampaign {
    _id: String
    name: String
    description: String
    startDate: String
    endDate: String
    status: String
    type: String
    amount: Float
    createdBy: User
    updatedBy: User
    conditions: JSON
  }

  type CouponCampaignListRepsponse {
    list: [CouponCampaign]
    pageInfo: PageInfo
    totalCount: Int
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
  getCouponCampaign(_id: String!): CouponCampaign
  getCouponCampaigns(${queryParams}): CouponCampaignListRepsponse
`;

const mutationParams = `
  name: String!
  description: String
  startDate: String
  endDate: String
  status: String

  type: String
  amount: Float
  conditions: JSON
`;

export const mutations = `
  createCouponCampaign(${mutationParams}): CouponCampaign
  updateCouponCampaign(_id: String!, ${mutationParams}): CouponCampaign
  removeCouponCampaign(_id: String!): CouponCampaign
`;
