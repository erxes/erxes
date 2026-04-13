import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Voucher {
    _id: String
    name: String
    description: String
    campaignId: String
    voucherCampaignId: String
    owner: Owner
    ownerId: String
    ownerType: String
    status: String
    createdAt: Date
    usedAt: Date
    createdBy: User
    updatedBy: User
    conditions: JSON
  }

  type VoucherListRepsponse {
    list: [Voucher]
    pageInfo: PageInfo
    totalCount: Int
  }

  type VoucherMainResponse {
    list: [Voucher]
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

const mainQueryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  campaignId: String
  status: String
  ownerId: String
  ownerType: String
  searchValue: String
  fromDate: String
  toDate: String
`;

export const queries = `
  vouchers(${queryParams}): VoucherListRepsponse
  vouchersMain(${mainQueryParams}): VoucherMainResponse
  ownerVouchers(ownerId: String!): JSON
`;

const mutationParams = `
  campaignId: String
  ownerId: String
  ownerType: String
  status: String
  conditions: JSON
`;

const mutationManyParams = `
  campaignId: String
  ownerType: String
  ownerIds: [String]
  tagIds: [String]
  status: String
`;

export const mutations = `
  vouchersAdd(${mutationParams}): Voucher
  vouchersAddMany(${mutationManyParams}): String
  vouchersEdit(_id: String!, ${mutationParams}): Voucher
  vouchersRemove(_ids: [String]): JSON
  vouchersRemoveByFilter(${mainQueryParams}): Int
  buyVoucher(campaignId: String, ownerType: String, ownerId: String, count: Int): Voucher
`;
