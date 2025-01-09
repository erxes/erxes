const transferMutation = `
mutation GolomtBankTransfer($configId: String!, $transfer: TransferInputGolomt) {
  golomtBankTransfer(configId: $configId, transfer: $transfer)
}
`;

export default {
  transferMutation
};
