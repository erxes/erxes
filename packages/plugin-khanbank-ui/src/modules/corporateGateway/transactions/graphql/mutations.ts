const transferMutation = `
mutation KhanbankTransfer($configId: String!, $transfer: 32,57:   khanbankTransfer(configId: String!, transfer: KhanbankTransferInput): JSON) {
    khanbankTransfer(configId: $configId, transfer: $transfer)
}
`;

export default {
  transferMutation
};
