import {
  commonCampaignInputs,
  commonCampaignTypes,
  commonFilterTypes,
  paginateTypes
} from './common';

export const types = `
  type DonateCampaign @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    ${commonCampaignTypes}

    maxScore: Float
    awards: JSON

    donatesCount: Int,
  }
`;

export const queries = `
  donateCampaignDetail(_id: String!): DonateCampaign
  donateCampaigns(${commonFilterTypes} ${paginateTypes}): [DonateCampaign]
  cpDonateCampaigns: [DonateCampaign]
  donateCampaignsCount(${commonFilterTypes}): Int
`;

const DonateCampaignDoc = `
  ${commonCampaignInputs}
  maxScore: Float
  awards: JSON
`;

export const mutations = `
  donateCampaignsAdd(${DonateCampaignDoc}): DonateCampaign
  donateCampaignsEdit(_id: String!, ${DonateCampaignDoc}): DonateCampaign
  donateCampaignsRemove(_ids: [String]): JSON
`;
