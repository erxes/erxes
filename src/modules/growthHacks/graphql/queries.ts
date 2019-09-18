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
    $skip: Int,
    ${commonParams}
  ) {
    growthHacks(
      stageId: $stageId,
      skip: $skip,
      ${commonParamDefs}
    ) {
      ${growthHackFields}
    }
  }
`;

const growthHacksPriorityMatrix = `
  query growthHacksPriorityMatrix(
    $sortField: String,
    $sortDirection: Int,
    ${commonParams}
  ) {
    growthHacksPriorityMatrix(
      sortField: $sortField,
      sortDirection: $sortDirection,
      ${commonParamDefs}
    ) {
      ${growthHackFields}
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

export default {
  growthHacks,
  growthHacksPriorityMatrix,
  growthHackDetail
};
