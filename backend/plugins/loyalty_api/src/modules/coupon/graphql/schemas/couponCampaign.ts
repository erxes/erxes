import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';
import { commonCampaignInputs, commonCampaignTypes } from '~/utils/common';

export const types = `
  enum Kind {
    amount
    percent
  }

  type CouponCampaign @key(fields: "_id"){
    _id: String!

    ${commonCampaignTypes}

    kind: Kind
    value: Float
    codeRule: JSON
    restrictions: JSON
    redemptionLimitPerUser: Int

    buyScore: Int
  }

  type CouponCampaignListResponse {
    list: [CouponCampaign]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String
  status: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  couponCampaign(_id: String): CouponCampaign
  couponCampaigns(${queryParams}): CouponCampaignListResponse
`;

const mutationParams = `
  ${commonCampaignInputs}

  kind: Kind
  value: Float
  codeRule: JSON
  restrictions: JSON
  redemptionLimitPerUser: Int
  buyScore: Int
  charSet: [String]
`;

export const mutations = `
  couponCampaignAdd(${mutationParams}): CouponCampaign
  couponCampaignEdit(_id: String, ${mutationParams}): CouponCampaign
  couponCampaignsRemove(_ids: [String]): JSON
`;
