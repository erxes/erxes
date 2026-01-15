import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Campaign {
    _id: String
    name: String
    description: String
    startDate: Date
    endDate: Date
    status: String
    type: String
    amount: Float
    createdBy: User
    updatedBy: User
    conditions: JSON

    kind: String
  }

  type CampaignListResponse {
    list: [Campaign]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String
  status: String
  fromDate: String
  toDate: String
  dateField: String
  kind: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  getCampaign(_id: String!): Campaign
  getCampaigns(${queryParams}): CampaignListResponse
`;

const mutationParams = `
  name: String
  kind: String!
  description: String
  startDate: Date
  endDate: Date
  status: String
  type: String
  amount: Float
  conditions: JSON
`;

export const mutations = `
  createCampaign(${mutationParams}): Campaign
  updateCampaign(_id: String!, ${mutationParams}): Campaign
  removeCampaign(_ids: [String]): Campaign
`;
