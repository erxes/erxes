import {
  commonCampaignInputs,
  commonCampaignTypes,
  commonFilters,
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
lotteriesCampaignCustomerList(${commonFilters} voucherCampaignId: String): LotteryMain
  lotteryCampaignWinnerList(${commonFilters} voucherCampaignId: String,awardId: String): LotteryMain
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
  doLottery(campaignId: String, awardId: String ): JSON
  doLotteryMultiple(campaignId: String, awardId: String,multiple: Int): String
  getNextChar(campaignId: String, awardId: String, prevChars: String):JSON
`;
