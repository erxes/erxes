const commonParams = `
  $assignedUserIds: [String],
  $nextDay: String,
  $nextWeek: String,
  $nextMonth: String,
  $noCloseDate: String,
  $overdue: String,
`;

const commonParamDefs = `
  assignedUserIds: $assignedUserIds,
  nextDay: $nextDay,
  nextWeek: $nextWeek,
  nextMonth: $nextMonth,
  noCloseDate: $noCloseDate,
  overdue: $overdue,
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
    $pipelineId: String,
    $stageId: String,
    $skip: Int,
    $search: String,
    $viewType: String,
    ${commonParams}
  ) {
    growthHacks(
      pipelineId: $pipelineId,
      stageId: $stageId,
      skip: $skip,
      search: $search,
      viewType: $viewType,
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
  growthHackDetail
};
