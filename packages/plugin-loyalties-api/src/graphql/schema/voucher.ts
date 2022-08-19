import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Voucher @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commonTypes}
    status: String
    bonusInfo: JSON
  }

  type VoucherMain {
    list: [Voucher]
    totalCount: Int
  }
`;

export const queries = `
  vouchersMain(${commonFilters}): VoucherMain
  vouchers(${commonFilters}): [Voucher]
  voucherDetail(_id: String!): Voucher
`;

const VoucherDoc = `
  ${commonInputs}
  status: String
`;

export const mutations = `
  vouchersAdd(${VoucherDoc}): Voucher
  vouchersEdit(_id: String!, ${VoucherDoc}): Voucher
  vouchersRemove(_ids: [String]): JSON
  buyVoucher(campaignId: String, ownerType: String, ownerId: String, count: Int): Voucher
`;
