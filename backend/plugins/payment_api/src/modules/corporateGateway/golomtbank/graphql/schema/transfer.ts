export const types = `

  input TransferInputGolomt {
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
  golomtBankTransfer(configId: String!, transfer: TransferInputGolomt): JSON
`;
