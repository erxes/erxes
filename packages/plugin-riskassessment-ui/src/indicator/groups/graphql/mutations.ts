const commonParams = `
  $name:String
  $description:String
  $tagIds:[String]
  $calculateMethod:String
  $calculateLogics:[ICalculateLogic]
  $groups:[IIndicatorGroups]
  $ignoreZeros:Boolean
`;

const commonParamsDef = `
  name:$name
  description:$description
  tagIds:$tagIds
  calculateMethod:$calculateMethod
  calculateLogics:$calculateLogics
  groups:$groups
  ignoreZeros:$ignoreZeros
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
