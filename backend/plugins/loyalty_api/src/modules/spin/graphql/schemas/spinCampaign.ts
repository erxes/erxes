import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';
import { commonCampaignInputs, commonCampaignTypes } from '~/utils/common';

export const types = `
  type SpinCampaign @key(fields: "_id") {
    _id: String,
    ${commonCampaignTypes}

    buyScore: Float,
    awards: JSON,

    spinsCount: Int,
  }

  type SpinCampaignListResponse {
    list: [SpinCampaign]
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
  spinCampaigns(${queryParams}): SpinCampaignListResponse
  spinCampaignDetail(_id: String!): SpinCampaign
  cpSpinCampaigns: [SpinCampaign]
`;

const mutationParams = `
  ${commonCampaignInputs}
  
  buyScore: Float,
  awards: JSON
`;

export const mutations = `
  spinCampaignsAdd(${mutationParams}): SpinCampaign
  spinCampaignsEdit(_id: String!, ${mutationParams}): SpinCampaign
  spinCampaignsRemove(_ids: [String]): JSON
`;
