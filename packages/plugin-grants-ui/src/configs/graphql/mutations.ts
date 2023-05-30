const commonParams = `
  $name: String, 
  $action: String,
  $params: String,
  $config: String,
  $scope:String
`;

const commonParamsDef = `
  name: $name,
  action: $action,
  params: $params,
  config: $config,
  scope: $scope
`;

const addConfig = `
mutation AddGrantConfig(${commonParams}) {
  addGrantConfig(${commonParamsDef}) {
    name
    action
    params
    createdAt
    modifiedAt
  }
}
`;

const editConfig = `
mutation EditGrantConfig($_id: String,${commonParams}) {
  editGrantConfig(_id: $_id,${commonParamsDef}) {
    name
    action
    params
    createdAt
    modifiedAt
  }
}
`;

const removeConfig = `
mutation RemoveGrantConfig($_id: String) {
  removeGrantConfig(_id: $_id)
}
`;

export default { addConfig, editConfig, removeConfig };
