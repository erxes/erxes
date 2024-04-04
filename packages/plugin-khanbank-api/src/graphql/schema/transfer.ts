export const types = `
  type KhanbankTransferResult {
    uuid: String
    journalNo: String
    transferid: String
    systemDate: String
  }

  enum TransferType {
    domestic
    interbank
  }

  input TransferInput {
    type: TransferType!
    fromAccount: String!
    toAccount: String!
    amount: Float!
    description: String!
    currency: String!
    loginName: String!
    password: String!
    transferid: String
    toCurrency: String
    toAccountName: String
    toBank: String
  }
`;

// TODO: Replace mutation return type with KhanbankTransferResult after testing. Not tested yet because of lack of credentials.
export const mutations = `
  khanbankTransfer(configId: String!, transfer: TransferInput): JSON
`;
