const commonParams = `
  $name:String
  $description:String
  $calculateMethod:String
  $calculateLogics:[ICalculateLogic]
  $groups:[IIndicatorGroups]
`;

const commonParamsDef = `
  name:$name
  description:$description
  calculateMethod:$calculateMethod
  calculateLogics:$calculateLogics
  groups:$groups
`;

const addGroups = `
    mutation AddRiskIndicatorsGroups(${commonParams}) {
      addRiskIndicatorsGroups(${commonParamsDef})
    }
`;

const updateGroups = `
mutation UpdateRiskIndicatorsGroups($_id:String,${commonParams}) {
  updateRiskIndicatorsGroups(_id:$_id,${commonParamsDef})
}
`;

const removeGroups = `
mutation RemoveRiskIndicatorsGroups($ids: [String]) {
  removeRiskIndicatorsGroups(ids: $ids)
}
`;

export default { addGroups, removeGroups, updateGroups };
