const commonParams = `
    $code: String,
    $description: String,
    $name: String
    $parentId: String
    $teamMemberIds: [String]
`;

const commonParamsDef = `
    code: $code,
    description: $description,
    name: $name,
    parentId: $parentId
    teamMemberIds: $teamMemberIds
`;

const addOperation = `
mutation AddOperation(${commonParams}) {
  addOperation(${commonParamsDef})
}
`;

const updateOperations = `
mutation UpdateOperation($_id: String,$order:String,${commonParams}) {
  updateOperation(_id: $_id,order:$order, ${commonParamsDef})
}
`;

const removeOperations = `
    mutation RemoveOperation($ids: [String]) {
      removeOperation(ids: $ids)
    }
`;

export default {
  addOperation,
  updateOperations,
  removeOperations
};
