import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Spin {
    _id: String
    campaignId: String
    ownerType: String
    ownerId: String
    owner: JSON
    status: String
    awardId: String
    voucherId: String
    voucherCampaignId: String
    number: String
    usedAt: Date
    createdAt: Date
    updatedAt: Date
  }

  type SpinListResponse {
    list: [Spin]
    pageInfo: PageInfo
    totalCount: Int
  }

  type SpinMainResponse {
    list: [Spin]
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
  spins(${queryParams}): SpinListResponse
  spinsMain(${mainQueryParams}): SpinMainResponse
`;

const mutationParams = `
  campaignId: String
  ownerType: String
  ownerId: String
  status: String
  voucherCampaignId: String
`;

export const mutations = `
  spinsAdd(${mutationParams}): Spin
  spinsEdit(_id: String!, ${mutationParams}): Spin
  spinsRemove(_ids: [String]): JSON
  doSpin(_id: String!): Spin
  buySpin(campaignId: String, ownerType: String, ownerId: String, count: Int): Spin
`;
