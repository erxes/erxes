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
  vouchers(${queryParams}): VoucherListRepsponse
  ownerVouchers(ownerId: String!): JSON
`;

const mutationParams = `  
  campaignId: String
  ownerId: String
  ownerType: String
  status: String
  conditions: JSON
`;

export const mutations = `
  vouchersAdd(${mutationParams}): Voucher
  vouchersAddMany(${mutationParams}): String
  vouchersEdit(_id: String!, ${mutationParams}): Voucher
  vouchersRemove(_ids: [String]): JSON
  buyVoucher(campaignId: String, ownerType: String, ownerId: String, count: Int): Voucher
`;
