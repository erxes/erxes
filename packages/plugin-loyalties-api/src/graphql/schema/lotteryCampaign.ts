import {
  commonCampaignInputs,
  commonCampaignTypes,
  commonFilterTypes,
  paginateTypes
} from './common';

export const types = `
  type LotteryCampaign @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    ${commonCampaignTypes}

    numberFormat: String,
    buyScore: Float,
    awards: JSON,

    lotteriesCount: Int,
  }
`;

export const queries = `
  lotteryCampaignDetail(_id: String!): LotteryCampaign
  lotteryCampaigns(${commonFilterTypes} ${paginateTypes}): [LotteryCampaign]
  cpLotteryCampaigns: [LotteryCampaign]
  lotteryCampaignsCount(${commonFilterTypes}): Int
`;

const LotteryCampaignDoc = `
  ${commonCampaignInputs}
  numberFormat: String,
  buyScore: Float,
  awards: JSON
`;

export const mutations = `
  lotteryCampaignsAdd(${LotteryCampaignDoc}): LotteryCampaign
  lotteryCampaignsEdit(_id: String!, ${LotteryCampaignDoc}): LotteryCampaign
  lotteryCampaignsRemove(_ids: [String]): JSON
`;
