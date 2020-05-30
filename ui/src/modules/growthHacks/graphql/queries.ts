const commonParams = `
  $pipelineId: String,
  $assignedUserIds: [String],
  $closeDateType: String,
  $search: String,
  $labelIds: [String],
  $userIds: [String],
`;

const commonParamDefs = `
  pipelineId: $pipelineId,
  assignedUserIds: $assignedUserIds,
  closeDateType: $closeDateType,
  search: $search,
  labelIds: $labelIds,
  userIds: $userIds,
`;

export const growthHackFields = `
  _id
  name
  stageId
  closeDate
  description
  assignedUsers {
    _id
    email
    details {
      fullName
      avatar
    }
  }
  voteCount
  priority
  hackStages
  reach
  impact
  confidence
  ease
  scoringType
  modifiedAt
  labels {
    _id
    name
    colorCode
  }
  status
  labelIds
  order
`;

const growthHackDetailFields = `
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
  labels {
    _id
    name
    colorCode
  }
  labelIds
  voteCount
  votedUsers {
    _id
    details {
      avatar
      fullName
    }
  }
  status
  isVoted
  modifiedAt
  modifiedBy
`;

const growthHacks = `
  query growthHacks(
    $stageId: String,
    $skip: Int,
    $limit: Int,
    $sortField: String,
    $sortDirection: Int,
    $hackStage: [String],
    $priority: [String],
    ${commonParams}
  ) {
    growthHacks(
      stageId: $stageId,
      skip: $skip,
      limit: $limit,
      sortField: $sortField,
      sortDirection: $sortDirection,
      hackStage: $hackStage,
      priority: $priority,
      ${commonParamDefs}
    ) {
      ${growthHackFields}
    }
  }
`;

const growthHacksTotalCount = `
  query growthHacksTotalCount(
    $stageId: String,
    $hackStage: [String],
    $priority: [String],
    ${commonParams}
  ) {
    growthHacksTotalCount(
      stageId: $stageId,
      hackStage: $hackStage,
      priority: $priority,
      ${commonParamDefs}
    )
  }
`;

const growthHacksPriorityMatrix = `
  query growthHacksPriorityMatrix(
    $pipelineId: String,
    $search: String,
    $assignedUserIds: [String],
    $closeDateType: String) {
    growthHacksPriorityMatrix(
      pipelineId: $pipelineId,
      search: $search,
      assignedUserIds: $assignedUserIds,
      closeDateType: $closeDateType
    )
  }
`;

const growthHackDetail = `
  query growthHackDetail($_id: String!) {
    growthHackDetail(_id: $_id) {
      ${growthHackDetailFields}
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

const pipelineStateCount = `
  query pipelineStateCount($boardId: String, $type: String) {
    pipelineStateCount(boardId: $boardId, type: $type)
  }
`;

const archivedGrowthHacks = `
  query archivedGrowthHacks(
    $pipelineId: String!,
    $search: String,
    $page: Int,
    $perPage: Int,
  ) {
    archivedGrowthHacks(
      pipelineId: $pipelineId,
      search: $search,
      page: $page,
      perPage: $perPage,
    ) {
      ${growthHackFields}
    }
  }
`;

const archivedGrowthHacksCount = `
  query archivedGrowthHacksCount(
    $pipelineId: String!,
    $search: String
  ) {
    archivedGrowthHacksCount(
      pipelineId: $pipelineId,
      search: $search
    )
  }
`;

export default {
  growthHacks,
  growthHacksPriorityMatrix,
  growthHackDetail,
  growthHacksTotalCount,
  pipelineDetail,
  pipelineStateCount,
  archivedGrowthHacks,
  archivedGrowthHacksCount
};
