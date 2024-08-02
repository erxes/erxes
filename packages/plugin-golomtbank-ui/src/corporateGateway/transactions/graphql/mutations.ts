const transferMutation = `
mutation GolomtBankTransfer($configId: String!, $refCode: String, $fromAmount: String, $toAmount: String, $fromDescription: String, $toDescription: String, $fromCurrency: String, $toCurrency: String, $toBank: String, $toAccountName: String, $toAccount: String, $fromAccount: String) {
  golomtBankTransfer(configId: $configId, refCode: $refCode, fromAmount: $fromAmount, toAmount: $toAmount, fromDescription: $fromDescription, toDescription: $toDescription, fromCurrency: $fromCurrency, toCurrency: $toCurrency, toBank: $toBank, toAccountName: $toAccountName, toAccount: $toAccount, fromAccount: $fromAccount)
}
`;

export default {
  transferMutation,
};
