export const types = `
  type golomtBankTransferResult {
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

export const mutations = `
  golomtBankTransfer(configId: String!, transfer: TransferInput): JSON
`;
