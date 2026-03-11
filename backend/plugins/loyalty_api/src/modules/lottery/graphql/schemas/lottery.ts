import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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
  }

  type LotteryListResponse {
    list: [Lottery]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  campaignId: String
  status: String
  ownerType: String
  ownerId: String
  voucherCampaignId: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  lotteries(${queryParams}): LotteryListResponse
`;

const mutationParams = `
  ownerId: String
  ownerType: String
  campaignId: String
  usedAt: Date
  status: String
`;

export const mutations = `
  lotteriesAdd(${mutationParams}): Lottery
  lotteriesEdit(_id: String!, ${mutationParams}): Lottery
  lotteriesRemove(_ids: [String]): JSON
  buyLottery(campaignId: String, ownerType: String, ownerId: String, count: Int): Lottery
`;
