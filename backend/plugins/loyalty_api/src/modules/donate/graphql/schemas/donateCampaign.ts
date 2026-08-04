import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';
import { commonCampaignInputs, commonCampaignTypes } from '~/utils/common';

export const types = `
  type DonateCampaign @key(fields: "_id") {
    _id: String,
    ${commonCampaignTypes}

    maxScore: Float
    awards: JSON

    donatesCount: Int,
  }

  type DonateCampaignListResponse {
    list: [DonateCampaign]
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
  donateCampaigns(${queryParams}): DonateCampaignListResponse
  donateCampaignDetail(_id: String!): DonateCampaign
  cpDonateCampaigns: [DonateCampaign]
`;

const mutationParams = `
  ${commonCampaignInputs}
  maxScore: Float
  awards: JSON
`;

export const mutations = `
  donateCampaignsAdd(${mutationParams}): DonateCampaign
  donateCampaignsEdit(_id: String!, ${mutationParams}): DonateCampaign
  donateCampaignsRemove(_ids: [String]): JSON
`;
