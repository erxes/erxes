import {
  commonCampaignInputs,
  commonCampaignTypes,
  commonFilterTypes,
  paginateTypes
} from './common';

export const types = `
  type SpinCampaign @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    ${commonCampaignTypes}

    buyScore: Float,
    awards: JSON,

    spinsCount: Int,
  }
`;

export const queries = `
  spinCampaignDetail(_id: String!): SpinCampaign
  spinCampaigns(${commonFilterTypes} ${paginateTypes}): [SpinCampaign]
  cpSpinCampaigns: [SpinCampaign]
  spinCampaignsCount(${commonFilterTypes}): Int
`;

const SpinCampaignDoc = `
  ${commonCampaignInputs}
  buyScore: Float,
  awards: JSON
`;

export const mutations = `
  spinCampaignsAdd(${SpinCampaignDoc}): SpinCampaign
  spinCampaignsEdit(_id: String!, ${SpinCampaignDoc}): SpinCampaign
  spinCampaignsRemove(_ids: [String]): JSON
`;
