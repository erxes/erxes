export const types = `
  type TdbTransferResponse {
    success: Boolean
    requestid: Int
    transactionNumber: String
    message: String
  }
`;

export const mutations = `
  tdbDomesticTransfer(
    configId: String!
    input: TdbDomesticTransferInput!
  ): TdbTransferResponse

  tdbInterbankTransfer(
    configId: String!
    input: TdbInterbankTransferInput!
  ): TdbTransferResponse
`;

export const inputs = `
  input TdbDomesticTransferInput {
    debtorAccount: String!
    creditorAccount: String!
    txnAmount: Float!
    txnDesc: String!
  }

  input TdbInterbankTransferInput {
    debtorAccount: String!
    creditorAccount: String!
    creditorCurrency: String!
    creditorAccountName: String!
    beneficiaryBankCode: Int!
    txnAmount: Float!
    txnDesc: String!
  }
`;