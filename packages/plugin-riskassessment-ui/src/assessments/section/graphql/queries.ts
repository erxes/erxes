const riskAssessment = `
query RiskAssessment($cardId: String, $cardType: String) {
  riskAssessment(cardId: $cardId, cardType: $cardType)
}
`;

// const riskAssessmentDetail = `

// `;

const riskAssessmentAssignedMembers = `
query Query($cardId: String, $cardType: String, $riskAssessmentId: String) {
  riskAssessmentAssignedMembers(cardId: $cardId, cardType: $cardType, riskAssessmentId: $riskAssessmentId)
}
`;

const riskAssessmentSubmitForm = `
query Query($cardId: String, $cardType: String, $riskAssessmentId: String, $userId: String) {
  riskAssessmentSubmitForm(cardId: $cardId, cardType: $cardType, riskAssessmentId: $riskAssessmentId, userId: $userId)
}
`;

const riskAssessmentIndicatorForm = `
query Query($indicatorId: String, $riskAssessmentId: String, $userId: String) {
  riskAssessmentIndicatorForm(indicatorId: $indicatorId, riskAssessmentId: $riskAssessmentId, userId: $userId)
}
`;

const commonIndicatorParams = `
  $departmentIds:[String]
  $branchIds:[String]
  $operationIds:[String],
  $categoryIds: [String],
  $searchValue: String,
  $perPage: Int
`;

const commonIndicatorParamsDef = `
  categoryIds: $categoryIds ,
  perPage: $perPage,
  searchValue: $searchValue,
  branchIds: $branchIds,
  departmentIds: $departmentIds
  operationIds: $operationIds
`;

const riskIndicators = `
  query RiskIndicators(${commonIndicatorParams}) {
    riskIndicators(${commonIndicatorParamsDef}) {
      _id,name,description,categoryId
    }
  }
  `;

export default {
  riskAssessment,
  riskAssessmentAssignedMembers,
  // riskAssessmentDetail,
  riskAssessmentSubmitForm,
  riskAssessmentIndicatorForm,
  riskIndicators
};
