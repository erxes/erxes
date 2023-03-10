const riskAssessment = `
query RiskAssessment($cardId: String, $cardType: String) {
  riskAssessment(cardId: $cardId, cardType: $cardType)
}
`;

const riskAssessmentGroups = `
  query RiskAssessmentGroups($groupIds: [String], $riskAssessmentId: String) {
    riskAssessmentGroups(groupIds: $groupIds, riskAssessmentId: $riskAssessmentId)
  }
`;

const riskAssessmentAssignedMembers = `
query RiskAssessmentAssignedMembers($cardId: String, $cardType: String, $riskAssessmentId: String) {
  riskAssessmentAssignedMembers(cardId: $cardId, cardType: $cardType, riskAssessmentId: $riskAssessmentId)
}
`;

const riskAssessmentSubmitForm = `
query RiskAssessmentSubmitForm($cardId: String, $cardType: String, $riskAssessmentId: String, $userId: String) {
  riskAssessmentSubmitForm(cardId: $cardId, cardType: $cardType, riskAssessmentId: $riskAssessmentId, userId: $userId)
}
`;

const riskAssessmentIndicatorForm = `
query RiskAssessmentIndicatorForm($indicatorId: String, $riskAssessmentId: String, $userId: String) {
  riskAssessmentIndicatorForm(indicatorId: $indicatorId, riskAssessmentId: $riskAssessmentId, userId: $userId)
}
`;

const commonIndicatorParams = `
  $departmentIds:[String]
  $branchIds:[String]
  $operationIds:[String],
  $categoryId: String,
  $searchValue: String,
  $perPage: Int
`;

const commonIndicatorParamsDef = `
  categoryId: $categoryId ,
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

const indicatorAssessments = `
  query IndicatorsAssessmentHistory($indicatorId: String) {
  indicatorsAssessmentHistory(indicatorId: $indicatorId) {
    _id
    assessmentId
    closedAt
    createdAt
    indicatorId
    indicator{
      _id,name
    }
    resultScore
    status
    statusColor
    submissions {
      _id
      fields
      user {
        _id
        details {
          avatar
          firstName
          lastName
        }
        email
      }
    }
  }
}
`;

export default {
  riskAssessment,
  riskAssessmentGroups,
  riskAssessmentAssignedMembers,
  riskAssessmentSubmitForm,
  riskAssessmentIndicatorForm,
  riskIndicators,
  indicatorAssessments
};
