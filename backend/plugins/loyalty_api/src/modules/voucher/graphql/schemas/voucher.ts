export const types = `
  type Voucher {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getVoucher(_id: String!): Voucher
  getVouchers: [Voucher]
`;

export const mutations = `
  createVoucher(name: String!): Voucher
  updateVoucher(_id: String!, name: String!): Voucher
  removeVoucher(_id: String!): Voucher
`;
