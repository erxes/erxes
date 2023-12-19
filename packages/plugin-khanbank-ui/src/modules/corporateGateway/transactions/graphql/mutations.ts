const transferMutation = `
mutation KhanbankTransfer($configId: String!, $transfer: TransferInput) {
    khanbankTransfer(configId: $configId, transfer: $transfer)
}
`;

export default {
  transferMutation
};
