const riskAssessmentParams = `
    $name: String!, 
    $id: String, 
    $categoryId: String, 
    $description: String, 
    $forms: [IRiskAssessmentForm],
    $calculateMethod:String,
    $calculateLogics:[CalculateLogicType],
`;

const riskAssessmentParamsDef = `
    name:$name,
    id:$id,
    categoryId:$categoryId,
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
