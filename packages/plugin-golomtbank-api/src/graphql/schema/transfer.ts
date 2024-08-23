export const types = `
  type golomtBankTransferResult {
    uuid: String
    journalNo: String
    transferid: String
    systemDate: String
  }
`;

export const mutations = `
  golomtBankTransfer(configId: String!, fromAccount: String, toAccount: String, toAccountName: String, toBank: String, toCurrency: String, fromCurrency: String, toDescription: String, fromDescription: String, toAmount: String, fromAmount: String, refCode: String): JSON
`;
