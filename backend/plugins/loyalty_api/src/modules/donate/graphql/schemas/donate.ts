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

    createdAt: Date
    updatedAt: Date
  }

  type DonateListResponse {
    list: [Donate]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  campaignId: String,
  ownerType: String,
  ownerId: String,

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  donates(${queryParams}): DonateListResponse
`;

const mutationParams = `
  donateScore: Float
  campaignId: String
  ownerId: String
  ownerType: String
  usedAt: Date
`;

export const mutations = `
  donatesAdd(${mutationParams}): Donate
  donatesRemove(_ids: [String]): JSON
  cpDonatesAdd(${mutationParams}): Donate
  cpDonatesRemove(_ids: [String]): JSON
`;
