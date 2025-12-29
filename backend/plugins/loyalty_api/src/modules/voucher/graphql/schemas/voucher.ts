import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Voucher {
    _id: String
    name: String
    description: String
    campaignId: String
    owner: Owner
    ownerType: String
    status: String
    createdBy: User
    updatedBy: User
    conditions: JSON
  }

  type VoucherListRepsponse {
    list: [Voucher]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  campaignId: String
  ownerId: String
  ownerType: String
  status: String
  fromDate: String
  toDate: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  getVoucher(_id: String!): Voucher
  getVouchers(${queryParams}): VoucherListRepsponse
`;

const mutationParams = `  
  campaignId: String
  ownerId: String
  ownerType: String
  status: String
  conditions: JSON
`;

export const mutations = `
  createVoucher(${mutationParams}): Voucher
  updateVoucher(_id: String!, ${mutationParams}): Voucher
  removeVoucher(_id: String!): Voucher
`;
