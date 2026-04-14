import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Lottery {
    _id: String
    ownerId: String
    ownerType: String
    owner: JSON
    campaignId: String
    status: String
    voucherCampaignId: String
    number: String
    awardId: String
    voucherId: String
    usedAt: Date
    createdAt: Date
    updatedAt: Date
  }

  type LotteryListResponse {
    list: [Lottery]
    pageInfo: PageInfo
    totalCount: Int
  }

  type LotteryMainResponse {
    list: [Lottery]
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

const mainQueryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  campaignId: String
  status: String
  ownerId: String
  ownerType: String
  voucherCampaignId: String
`;

export const queries = `
  lotteries(${queryParams}): LotteryListResponse
  lotteriesMain(${mainQueryParams}): LotteryMainResponse
`;

const mutationParams = `
  ownerId: String
  ownerType: String
  campaignId: String
  usedAt: Date
  status: String
  voucherCampaignId: String
`;

export const mutations = `
  lotteriesAdd(${mutationParams}): Lottery
  lotteriesEdit(_id: String!, ${mutationParams}): Lottery
  lotteriesRemove(_ids: [String]): JSON
  buyLottery(campaignId: String, ownerType: String, ownerId: String, count: Int): Lottery
`;
