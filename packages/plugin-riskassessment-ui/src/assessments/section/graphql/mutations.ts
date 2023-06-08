import {
  commonFormSaveParams,
  commonFormSaveParamsDef
} from '../../common/graphql';

const commonParams = `
    $branchId: String,
    $cardId: String,
    $cardType: String,
    $groupId: String,
    $departmentId: String,
    $indicatorId: String,
    $operationId: String
    $groupsAssignedUsers:[GroupsAssignedUsers]
`;

const commonParamsDef = `
    branchId: $branchId,
    cardId: $cardId,
    cardType: $cardType,
    groupId: $groupId,
    departmentId: $departmentId,
    indicatorId: $indicatorId,
    operationId: $operationId
    groupsAssignedUsers:$groupsAssignedUsers
`;

const commonFields = `
    _id
    cardId
    cardType
    createdAt
    resultScore
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

const addBulkAssessment = `
mutation AddBulkRiskAssessment($cardId:String,$cardType:String,$bulkItems: [IBulkAddAssessment]) {
  addBulkRiskAssessment(cardId:$cardId,cardType:$cardType,bulkItems: $bulkItems) {
    _id
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

const riskFormSaveSubmission = `
  mutation RiskFormSaveSubmissions(${commonFormSaveParams}) {
    riskFormSaveSubmissions(${commonFormSaveParamsDef})
  }
`;

const checkTestScore = `
  mutation RAIndicatorTestScore($formSubmissions: JSON, $indicatorId: String) {
    RAIndicatorTestScore(formSubmissions: $formSubmissions, indicatorId: $indicatorId)
  }
`;

export default {
  addRiskAssessment,
  editRiskAssessment,
  removeRiskAssessment,
  riskFormSaveSubmission,
  addBulkAssessment,
  checkTestScore
};
