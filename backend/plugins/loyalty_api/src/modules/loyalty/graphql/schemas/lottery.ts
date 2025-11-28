import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Lottery @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commonTypes}
    status: String
    number: String
    awardId: String
    voucherId: String
  }

  type LotteryMain {
    list: [Lottery]
    totalCount: Int
  }
`;

export const queries = `
  lotteriesMain(${commonFilters} voucherCampaignId: String): LotteryMain
  lotteries(${commonFilters} voucherCampaignId: String): [Lottery]
  lotteryDetail(_id: String!): Lottery
`;

const LotteryDoc = `
  ${commonInputs}
  status: String
`;

export const mutations = `
  lotteriesAdd(${LotteryDoc}): Lottery
  lotteriesEdit(_id: String!, ${LotteryDoc}): Lottery
  lotteriesRemove(_ids: [String]): JSON
  buyLottery(campaignId: String, ownerType: String, ownerId: String, count: Int): Lottery
`;
