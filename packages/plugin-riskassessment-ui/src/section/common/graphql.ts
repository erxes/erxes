export const commonConformityParams = `
  $cardId: String!
  $cardType: String
  $indicatorId: String
  $groupId:String
  $operationIds:[String]
  $branchIds:[String]
  $departmentIds: [String]
`;

export const commonConformityParamsDef = `
  cardId: $cardId,
  cardType: $cardType,
  indicatorId: $indicatorId,
  groupId:$groupId
  branchIds: $branchIds,
  departmentIds: $departmentIds
  operationIds: $operationIds,
`;

export const commonFormSaveParams = `
  $cardId: String,
  $cardType:String,
  $fieldId: String,
  $formSubmissions: JSON,
  $customScore:Int
  $userId: String,
  $indicatorId:String
`;
export const commonFormSaveParamsDef = `
  cardId: $cardId,
  cardType:$cardType ,
  fieldId: $fieldId,
  formSubmissions: $formSubmissions,
  customScore: $customScore
  userId: $userId,
  indicatorId: $indicatorId
`;
