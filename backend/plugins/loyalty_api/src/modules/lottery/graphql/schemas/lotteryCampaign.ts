export const types = `
  type LotteryCampaign {
    _id: String
    name: String
    description: String
    status: String

    numberFormat: String
    buyScore: Float
    awards: JSON

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
  getLotteryCampaigns(${queryParams}): [LotteryCampaign]
  getLotteryCampaignDetail(_id: String!): LotteryCampaign

  getLotteryCampaignWinnerList(
    campaignId: String!
    awardId: String!
  ): JSON

  getLotteryCampaignCustomerList(
    campaignId: String!
  ): JSON
`;

const mutationParams = `
  name: String
  description: String
  status: String

  numberFormat: String
  buyScore: Float
  awards: JSON
`;
export const mutations = `
  createLotteryCampaign(${mutationParams}): LotteryCampaign
  updateLotteryCampaign(_id: String!, ${mutationParams}): LotteryCampaign
  removeLotteryCampaign(_id: String!): LotteryCampaign

  doLottery(campaignId: String, awardId: String): JSON
  doLotteryMultiple(campaignId: String, awardId: String, multiple: Int): String
  getNextChar(campaignId: String, awardId: String, prevChars: String): JSON
`;

