const removeAssessments = `
mutation RemoveRiskAssessments($ids: [String]) {
  removeRiskAssessments(ids: $ids)
}
`;
export default { removeAssessments };
