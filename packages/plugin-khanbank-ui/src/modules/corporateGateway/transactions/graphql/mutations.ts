const transferMutation = `
mutation KhanbankTransfer($configId: String!, $transfer: KhanbankTransferInput) {
  khanbankTransfer(configId: $configId, transfer: $transfer)
}
`;

export default {
  transferMutation
};
