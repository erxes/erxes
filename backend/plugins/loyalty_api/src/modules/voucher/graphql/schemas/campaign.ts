import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type VoucherCampaign {
    _id: String
    name: String
    description: String
    startDate: String
    endDate: String
    status: String
    type: String
    amount: Float
    createdBy: User
    updatedBy: User
    conditions: JSON
  }

  type VoucherCampaignListRepsponse {
    list: [VoucherCampaign]
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

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  getVoucherCampaign(_id: String!): VoucherCampaign
  getVoucherCampaigns(${queryParams}): VoucherCampaignListRepsponse
`;

const mutationParams = `
  name: String!
  description: String
  startDate: String
  endDate: String
  status: String

  type: String
  amount: Float
  conditions: JSON
`;

export const mutations = `
  createVoucherCampaign(${mutationParams}): VoucherCampaign
  updateVoucherCampaign(_id: String!, ${mutationParams}): VoucherCampaign
  removeVoucherCampaign(_id: String!): VoucherCampaign
`;
