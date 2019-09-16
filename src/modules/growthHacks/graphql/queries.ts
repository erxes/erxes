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
  hackDescription
  hackStages
  priority
  goal
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
    $date: ItemDate,
    $skip: Int,
    $search: String,
    ${commonParams}
  ) {
    growthHacks(
      pipelineId: $pipelineId,
      stageId: $stageId,
      date: $date,
      skip: $skip,
      search: $search,
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
