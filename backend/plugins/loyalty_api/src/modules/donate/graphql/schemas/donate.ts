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

    createdBy: String
    updatedBy: String
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
  getDonates(params: ${queryParams}): DonateListResponse
`;

const mutationParams = `
  donateScore: Float,
  campaignId: String,
  ownerId: String,
  ownerType: String
`;

export const mutations = `
  createDonate(${mutationParams}): Donate
  removeDonate(_id: String!): Donate
`;
