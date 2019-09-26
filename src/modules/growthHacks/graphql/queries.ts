const commonParams = `
  $pipelineId: String,
  $assignedUserIds: [String],
  $nextDay: String,
  $nextWeek: String,
  $nextMonth: String,
  $noCloseDate: String,
  $overdue: String,
  $search: String,
`;

const commonParamDefs = `
  pipelineId: $pipelineId,
  assignedUserIds: $assignedUserIds,
  nextDay: $nextDay,
  nextWeek: $nextWeek,
  nextMonth: $nextMonth,
  noCloseDate: $noCloseDate,
  overdue: $overdue,
  search: $search,
`;

const growthHackFields = `
  _id
  name
  stageId
  pipeline {
    _id
    name
  }
  boardId
  closeDate
  description
  hackStages
  priority
  reach
  impact
  confidence
  ease
  scoringType
  assignedUsers {
    _id
    email
    details {
      fullName
      avatar
    }
  }
  stage {
    probability
    name
  }
  isWatched
  attachments {
    name
    url
    type
    size
  }
  formSubmissions
  formFields {
    _id
    type
    validation
    text
    description
    options
    isRequired
    order
  }
  formId
  modifiedAt
  modifiedBy
`;

const growthHacks = `
  query growthHacks(
    $stageId: String,
    $limit: Int,
    $sortField: String,
    $sortDirection: Int,
    ${commonParams}
  ) {
    growthHacks(
      stageId: $stageId,
      limit: $limit,
      sortField: $sortField,
      sortDirection: $sortDirection,
      ${commonParamDefs}
    ) {
      ${growthHackFields}
    }
  }
`;

const growthHacksTotalCount = `
  query growthHacksTotalCount(
    $stageId: String,
    ${commonParams}
  ) {
    growthHacksTotalCount(
      stageId: $stageId,
      ${commonParamDefs}
    )
  }
`;

const growthHacksPriorityMatrix = `
  query growthHacksPriorityMatrix(
    ${commonParams}
  ) {
    growthHacksPriorityMatrix(
      ${commonParamDefs}
    ) {
      name
      impact
      ease
    }
  }
`;

const growthHackDetail = `
  query growthHackDetail($_id: String!) {
    growthHackDetail(_id: $_id) {
      ${growthHackFields}
    }
  }
`;

const pipelineDetail = `
  query pipelineDetail($_id: String!) {
    pipelineDetail(_id: $_id) {
      _id
      name
      bgColor
      hackScoringType
    }
  }
`;

export default {
  growthHacks,
  growthHacksPriorityMatrix,
  growthHackDetail,
  growthHacksTotalCount,
  pipelineDetail
};
