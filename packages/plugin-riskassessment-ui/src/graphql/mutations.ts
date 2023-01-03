const riskAssessmentParams = `
    $name: String!, 
    $categoryIds: [String],
    $departmentIds: [String],
    $branchIds: [String],
    $description: String, 
    $forms: [IRiskAssessmentForm],
    $calculateMethod:String,
    $calculateLogics:[ICalculateLogic],
`;

const riskAssessmentParamsDef = `
    name:$name,
    categoryIds:$categoryIds,
    departmentIds:$departmentIds,
    branchIds:$branchIds,
    description:$description,
    forms:$forms,
    calculateMethod:$calculateMethod,
    calculateLogics:$calculateLogics,
`;

const riskAssessmentAdd = `
mutation AddRiskAssesment(${riskAssessmentParams}) {
  addRiskAssesment(${riskAssessmentParamsDef})
}
`;

const riskAssesmentRemove = `
  mutation RemoveRiskAssessment($_ids:[String]){
    removeRiskAssessment(_ids: $_ids)
  }
`;

const riskAssessmentUpdate = `
  mutation UpdateRiskAssessment($doc:IRiskAssessment){
    updateRiskAssessment(doc:$doc)
  }
`;

const removeUnusedRiskAssessmentForm = `
mutation RemoveUnusedRiskAssessmentForm($formIds: [String]) {
  removeUnusedRiskAssessmentForm(formIds: $formIds)
}
`;

export default {
  riskAssessmentAdd,
  riskAssesmentRemove,
  riskAssessmentUpdate,
  removeUnusedRiskAssessmentForm
};
