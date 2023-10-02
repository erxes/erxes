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

const createActionInRoot = `
mutation CreateActionRcfaRoot($mainType: String, $mainTypeId: String, $destinationType: String, $destinationStageId: String,$issueId:String,$name:String) {
  createActionRcfaRoot(mainType: $mainType, mainTypeId: $mainTypeId, destinationType: $destinationType, destinationStageId: $destinationStageId,issueId:$issueId,name:$name) 
}
`;

const closeIssue = `
mutation CloseRcfaRoot($_id: String) {
  closeRcfaRoot(_id: $_id)
}
`;

const createTaskInRoot = `
mutation CreateTaskRcfaRoot($issueId: String,$stageId:String, $name: String) {
  createTaskRcfaRoot(issueId: $issueId,stageId:$stageId, name: $name)
}
`;

export default {
  addIssue,
  editIssue,
  removeIssue,
  closeIssue,
  createTaskInRoot,
  createActionInRoot
};
