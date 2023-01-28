import { riskIndicatorParams } from '../../../common/graphql';

const commonParams = `
    $branchIds: [String],
    $cardId: String,
    $cardType: String,
    $groupId: String,
    $departmentIds: [String],
    $indicatorId: String,
    $operationIds: [String]
`;

const commonParamsDef = `
    branchIds: $branchIds,
    cardId: $cardId,
    cardType: $cardType,
    groupId: $groupId,
    departmentIds: $departmentIds,
    indicatorId: $indicatorId,
    operationIds: $operationIds
`;

const commonFields = `
    _id
    branchIds
    branches
    cardId
    cardType
    createdAt
    departmentIds
    departments
    operationIds
    operations
    resultScore
    riskIndicatorId
    riskIndicator {
      ${riskIndicatorParams}
    }
    status
    statusColor
`;

const addRiskAssessment = `
mutation AddRiskAssessment(${commonParams}) {
  addRiskAssessment(${commonParamsDef}) {
    ${commonFields}
  }
}
`;

const editRiskAssessment = `
mutation EditRiskAssessment($_id: String,${commonParams}) {
  editRiskAssessment(_id: $_id,${commonParamsDef}) {
    ${commonFields}
  }
}
`;

const removeRiskAssessment = `
mutation RemoveRiskAssessment($riskAssessmentId: String) {
  removeRiskAssessment(riskAssessmentId: $riskAssessmentId) {
    ${commonFields}
  }
}
`;

export default { addRiskAssessment, editRiskAssessment, removeRiskAssessment };
