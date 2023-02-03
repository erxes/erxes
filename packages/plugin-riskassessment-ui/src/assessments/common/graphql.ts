export const commonFormSaveParams = `
  $cardId: String,
  $cardType:String,
  $fieldId: String,
  $formSubmissions: JSON,
  $riskAssessmentId:String
  $customScore:Int
  $userId: String,
  $indicatorId:String
`;
export const commonFormSaveParamsDef = `
  cardId: $cardId,
  cardType:$cardType ,
  fieldId: $fieldId,
  riskAssessmentId: $riskAssessmentId
  formSubmissions: $formSubmissions,
  customScore: $customScore
  userId: $userId,
  indicatorId: $indicatorId
`;
