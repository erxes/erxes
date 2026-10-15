import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Donate {
    _id: String!
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
  donatesMain(${mainQueryParams}, clientPortal:String): DonateMainResponse
  cpDonatesMain(${mainQueryParams}, clientPortal:String): DonateMainResponse
`;

const mutationParams = `
  donateScore: Float
  usedAt: Date
  status: String
  voucherCampaignId: String
`;

export const mutations = `
  donatesAdd(
    campaignId: String!
    ownerId: String!
    ownerType: String!
    ${mutationParams}
  ): Donate
  donatesEdit(
    _id: String!
    campaignId: String
    ownerId: String
    ownerType: String
    ${mutationParams}
  ): Donate
  donatesRemove(_ids: [String!]!): JSON
  cpDonatesAdd(
    campaignId: String
    ownerId: String
    ownerType: String
    ${mutationParams}
  ): Donate
  cpDonatesRemove(_ids: [String]): JSON
`;
