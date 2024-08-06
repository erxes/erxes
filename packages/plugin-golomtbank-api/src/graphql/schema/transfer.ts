export const types = `

  input TransferInput {
    type: String!
    fromAccount: String!
    toAccount: String!
    amount: Float!
    description: String!
    fromCurrency: String!
    toCurrency: String!
    toAccountName: String!
    fromAccountName: String!
    toBank: String!
    refCode: String
  }
`;

export const mutations = `
  golomtBankTransfer(configId: String!, transfer: TransferInput): JSON
`;
