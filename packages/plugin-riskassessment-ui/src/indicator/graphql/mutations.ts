const riskIndicatorParams = `
    $name: String!, 
    $description: String, 
    $categoryIds: [String],
    $departmentIds: [String],
    $branchIds: [String],
    $calculateMethod:String,
    $calculateLogics:[ICalculateLogic],
    $customScoreField:ICustomScoreField
    $forms: [IRiskIndicatorForm],
`;

const riskIndicatorParamsDef = `
    name:$name,
    description:$description,
    categoryIds:$categoryIds,
    departmentIds:$departmentIds,
    branchIds:$branchIds,
    calculateMethod:$calculateMethod,
    calculateLogics:$calculateLogics,
    customScoreField:$customScoreField,
    forms:$forms,
`;

const riskIndicatorAdd = `
mutation AddRiskIndicator(${riskIndicatorParams}) {
  addRiskIndicator(${riskIndicatorParamsDef})
}
`;

const riskIndicatorRemove = `
  mutation RemoveRiskIndicator($_ids:[String]){
    removeRiskIndicator(_ids: $_ids)
  }
`;

const riskIndicatorUpdate = `
  mutation UpdateRiskIndicator($doc:IRiskIndicator){
    updateRiskIndicator(doc:$doc)
  }
`;

const removeUnusedRiskIndicatorForm = `
mutation RemoveUnusedRiskIndicatorForm($formIds: [String]) {
  removeUnusedRiskIndicatorForm(formIds: $formIds)
}
`;

export default {
  riskIndicatorAdd,
  riskIndicatorRemove,
  riskIndicatorUpdate,
  removeUnusedRiskIndicatorForm
};
