import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Voucher {
    ${commonTypes}
    status: String
  }
`;

const VoucherDoc = `
  ${commonInputs}
  status: String
`


export const queries = `
  voucherDetail(_id: String!): Voucher
  vouchers(${commonFilters}): [Voucher]
  getVouchers(${commonFilters}): [Voucher]
`;

export const mutations = `
  vouchersAdd(${VoucherDoc}): Voucher
  vouchersEdit(_id: String!, ${VoucherDoc}): Voucher
  vouchersRemove(_ids: [String]): JSON
`;
