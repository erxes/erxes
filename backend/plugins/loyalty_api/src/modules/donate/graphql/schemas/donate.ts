import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Donate {
    _id: String
    campaignId: String
    ownerId: String
    ownerType: String
    donateScore: Float
    awardId: String
    voucherId: String
    usedAt: Date
    status: String
    number: String
    voucherCampaignId: String
    owner: JSON

    createdAt: Date
    updatedAt: Date
  }

  type DonateListResponse {
    list: [Donate]
    pageInfo: PageInfo
    totalCount: Int
  }

  type DonateMainResponse {
    list: [Donate]
    totalCount: Int
  }
`;

const queryParams = `
  campaignId: String,
  ownerType: String,
  ownerId: String,

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
  donates(${queryParams}): DonateListResponse
  donatesMain(${mainQueryParams}): DonateMainResponse
`;

const mutationParams = `
  donateScore: Float
  campaignId: String
  ownerId: String
  ownerType: String
  usedAt: Date
  status: String
  voucherCampaignId: String
`;

export const mutations = `
  donatesAdd(${mutationParams}): Donate
  donatesEdit(_id: String!, ${mutationParams}): Donate
  donatesRemove(_ids: [String]): JSON
  cpDonatesAdd(${mutationParams}): Donate
  cpDonatesRemove(_ids: [String]): JSON
`;
