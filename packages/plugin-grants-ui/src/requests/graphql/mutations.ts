const removeRequests = `
mutation RemoveGrantRequests($ids: [String]) {
  removeGrantRequests(ids: $ids)
}
`;
export default { removeRequests };
