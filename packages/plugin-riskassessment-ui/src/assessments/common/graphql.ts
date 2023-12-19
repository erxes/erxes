export const commonFormSaveParams = `
  $cardId: String,
  $cardType:String,
  $fieldId: String,
  $formSubmissions: JSON,
  $riskAssessmentId:String
  $userId: String,
  $indicatorId:String
  $branchId:String
  $departmentId:String
  $operationId:String
`;
export const commonFormSaveParamsDef = `
  cardId: $cardId,
  cardType:$cardType ,
  fieldId: $fieldId,
  riskAssessmentId: $riskAssessmentId
  formSubmissions: $formSubmissions,
  userId: $userId,
  indicatorId: $indicatorId,
  branchId:$branchId,
  departmentId:$departmentId,
  operationId:$operationId,
`;
