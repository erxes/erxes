const commonTypes = `
    _id
    rcfaId
    issue
    parentId
    createdAt
`;

const addIssue = `
mutation AddRcfaIssue($issue: String,$parentId:String ,$mainType: String, $mainTypeId: String) {
  addRcfaIssue(issue: $issue,parentId:$parentId ,mainType: $mainType, mainTypeId: $mainTypeId) { ${commonTypes} }
}
`;

const editIssue = `
mutation EditRcfaIssue($_id: String, $doc: JSON) {
  editRcfaIssue(_id: $_id, doc: $doc) { ${commonTypes} }
}
`;

const removeIssue = `
  mutation DeleteRcfaIssue($_id: String) {
    deleteRcfaIssue(_id: $_id) { ${commonTypes} }
  }
`;

const resolveRCFA = `
mutation ResolveRCFA($mainType: String, $mainTypeId: String, $destinationType: String, $destinationStageId: String,$issueId:String) {
  resolveRCFA(mainType: $mainType, mainTypeId: $mainTypeId, destinationType: $destinationType, destinationStageId: $destinationStageId,issueId:$issueId) {
    _id
    mainType
    mainTypeId
    relType
    relTypeId
    status
    createdAt
    userId
    closedAt
  }
}
`;

const closeIssue = `
mutation CloseRcfaRoot($_id: String) {
  closeRcfaRoot(_id: $_id)
}
`;

const createActionInRoot = `
mutation CreateActionRcfaRoot($issueId: String, $name: String) {
  createActionRcfaRoot(issueId: $issueId, name: $name)
}
`;

export default {
  addIssue,
  editIssue,
  removeIssue,
  resolveRCFA,
  closeIssue,
  createActionInRoot
};
