import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Voucher @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commonTypes}
    status: String
    bonusInfo: JSON
    campaign: VoucherCampaign
  }

  type VoucherMain {
    list: [Voucher]
    totalCount: Int
  }
`;

const queryParams = `
  ${commonFilters}
  fromDate: String
  toDate: String
`

export const queries = `
  vouchersMain(${queryParams}): VoucherMain
  vouchers(${queryParams}): [Voucher]
  ownerVouchers(ownerId: String!): JSON
  voucherDetail(_id: String!): Voucher
`;

const VoucherDoc = `
  ${commonInputs}

  ownerIds: [String]
  tagIds: [String]

  status: String
`;

export const mutations = `
  vouchersAdd(${VoucherDoc}): Voucher
  vouchersAddMany(${VoucherDoc}): String
  vouchersEdit(_id: String!, ${VoucherDoc}): Voucher
  vouchersRemove(_ids: [String]): JSON
  buyVoucher(campaignId: String, ownerType: String, ownerId: String, count: Int): Voucher
`;
