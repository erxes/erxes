export const types = `
  type Lottery {
    _id: String
    ownerId: String
    ownerType: String
    campaignId: String
    status: String
    voucherCampaignId: String
    number: String
    awardId: String
    voucherId: String
    createdAt: String
    updatedAt: String
    createdBy: String
    updatedBy: String
  }
`;

const queryParams = `
  campaignId: String
  status: String
  ownerType: String
  ownerId: String
  voucherCampaignId: String
`;

export const queries = `
  getLotteries(${queryParams}): [Lottery]
`;

const mutationParams = `
  ownerId: String
  ownerType: String
  campaignId: String
  voucherCampaignId: String
  count: Int
`;

export const mutations = `
  createLottery(${mutationParams}): Lottery
  updateLottery(_id: String!, ${mutationParams}): Lottery
  removeLottery(_id: String!): Lottery

  buyLottery(campaignId: String, ownerType: String, ownerId: String, count: Int): Lottery
  doLottery(campaignId: String, awardId: String ): JSON
  doLotteryMultiple(campaignId: String, awardId: String,multiple: Int): String
  getNextChar(campaignId: String, awardId: String, prevChars: String):JSON
`;
