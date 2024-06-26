const transferMutation = `
mutation GolomtBankTransfer($configId: String!, $fromAccount: String, $toAccount: String, $toAccountName: String, $fromBank: String, $toBank: String, $toCurrency: String, $fromCurrency: String, $toDescription: String, $fromDescription: String, $toAmount: String, $fromAmount: String) {
  golomtBankTransfer(configId: $configId, fromAccount: $fromAccount, toAccount: $toAccount, toAccountName: $toAccountName, fromBank: $fromBank, toBank: $toBank, toCurrency: $toCurrency, fromCurrency: $fromCurrency, toDescription: $toDescription, fromDescription: $fromDescription, toAmount: $toAmount, fromAmount: $fromAmount)
}
`;

export default {
  transferMutation,
};
