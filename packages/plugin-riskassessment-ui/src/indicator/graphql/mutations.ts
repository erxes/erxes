const riskIndicatorParams = `
    $name: String!, 
    $description: String, 
    $tagIds: [String],
    $operationIds:[String]
    $departmentIds: [String],
    $branchIds: [String],
    $calculateMethod:String,
    $calculateLogics:[ICalculateLogic],
    $forms: [IRiskIndicatorForm],
    $isWithDescription:Boolean
`;

const riskIndicatorParamsDef = `
    name:$name,
    description:$description,
    tagIds:$tagIds,
    operationIds: $operationIds,
    departmentIds:$departmentIds,
    branchIds:$branchIds,
    calculateMethod:$calculateMethod,
    calculateLogics:$calculateLogics,
    forms:$forms,
    isWithDescription:$isWithDescription
`;

const riskIndicatorAdd = `
mutation AddRiskIndicator(${riskIndicatorParams}) {
  addRiskIndicator(${riskIndicatorParamsDef})
}
`;

const riskIndicatorRemove = `
  mutation RemoveRiskIndicators($_ids:[String]){
    removeRiskIndicators(_ids: $_ids)
  }
`;

const riskIndicatorUpdate = `
  mutation UpdateRiskIndicator($_id:String, ${riskIndicatorParams}){
    updateRiskIndicator(_id:$_id,${riskIndicatorParamsDef})
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
