const transferMutation = `
mutation GolomtBankTransfer($configId: String!, $transfer: TransferInput) {
  golomtBankTransfer(configId: $configId, transfer: $transfer)
}
`;

export default {
  transferMutation,
};
