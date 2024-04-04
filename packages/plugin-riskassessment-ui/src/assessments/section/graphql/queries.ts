const riskAssessment = `
query RiskAssessment($cardId: String, $cardType: String) {
  riskAssessment(cardId: $cardId, cardType: $cardType){
    _id,
    status,
    statusColor,
    resultScore,
    cardId,
    cardType,
    branchId
    branch{
      _id,title
    }
    departmentId,
    department {
      _id,title
    }
    operationId,
    operation{
      _id,name
    },
    groupId,
    group {
      _id,name
    }
    indicatorId
    indicator {
      _id,name
    }
    isSplittedUsers,
    createdAt,
    permittedUserIds
  }
}
`;

const riskAssessmentGroups = `
  query RiskAssessmentGroups($groupIds: [String], $riskAssessmentId: String) {
    riskAssessmentGroups(groupIds: $groupIds, riskAssessmentId: $riskAssessmentId)
  }
`;

const riskAssessmentAssignedMembers = `
query RiskAssessmentAssignedMembers($cardId: String, $cardType: String,) {
  riskAssessmentAssignedMembers(cardId: $cardId, cardType: $cardType){
    _id,
    email,
    username,
    submitStatus
    details{
      avatar,
      firstName,
      lastName,
      middleName,
      fullName,
    }
  }
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
  $ids:[String],
  $departmentIds:[String]
  $branchIds:[String]
  $operationIds:[String],
  $tagIds: [String],
  $searchValue: String,
  $perPage: Int
`;

const commonIndicatorParamsDef = `
  ids:$ids,
  tagIds: $tagIds ,
  perPage: $perPage,
  searchValue: $searchValue,
  branchIds: $branchIds,
  departmentIds: $departmentIds
  operationIds: $operationIds
`;

const riskIndicators = `
  query RiskIndicators(${commonIndicatorParams}) {
    riskIndicators(${commonIndicatorParamsDef}) {
      _id,name,description,tagIds
    }
  }
  `;

const indicatorAssessments = `
  query IndicatorsAssessmentHistory($indicatorId: String,$branchId: String,$departmentId: String,$operationId: String) {
  indicatorsAssessmentHistory(indicatorId: $indicatorId,branchId:$branchId,departmentId:$departmentId,operationId:$operationId) {
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
const riskIndicatorsGroup = `
    query RiskIndicatorsGroup ($_id:String) {
        riskIndicatorsGroup(_id:$_id){
            _id,
            name,
            tagIds
            groups {
                _id
                name
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
  indicatorAssessments,
  riskIndicatorsGroup
};
