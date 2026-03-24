import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Spin {
    _id: String
    campaignId: String
    ownerType: String
    ownerId: String

    status: String
    awardId: String
    voucherId: String
  }

  type SpinListResponse {
    list: [Spin]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  campaignId: String
  searchValue: String
  status: String
  ownerType: String
  ownerId: String

  voucherCampaignId: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  spins(${queryParams}): SpinListResponse
`;

const mutationParams = `
  campaignId: String
  ownerType: String
  ownerId: String

  status: String
`;

export const mutations = `
  spinsAdd(${mutationParams}): Spin
  spinsEdit(_id: String!, ${mutationParams}): Spin
  spinsRemove(_ids: [String]): JSON
  doSpin(_id: String!): Spin
  buySpin(campaignId: String, ownerType: String, ownerId: String, count: Int): Spin
`;
