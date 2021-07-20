const commonParams = `
  $pipelineId: String,
  $assignedUserIds: [String],
  $closeDateType: String,
  $search: String,
  $labelIds: [String],
  $userIds: [String],
  $assignedToMe: String
`;

const commonParamDefs = `
  pipelineId: $pipelineId,
  assignedUserIds: $assignedUserIds,
  closeDateType: $closeDateType,
  assignedToMe: $assignedToMe,
  search: $search,
  labelIds: $labelIds,
  userIds: $userIds,
`;

const commonFields = `
  _id
  name
  stageId
  closeDate
  description
  voteCount
  priority
  hackStages
  reach
  impact
  confidence
  ease
  scoringType
  modifiedAt
  status
  labelIds

  labels {
    _id
    name
    colorCode
  }

  assignedUsers 
`;

export const growthHackFields = `
  ${commonFields}
  order

  stage {
    name
  }
`;

const growthHackDetailFields = `
  ${commonFields}
  pipeline {
    _id
    name
  }
  boardId

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

  votedUsers {
    _id
    details {
      avatar
      fullName
    }
  }
  isVoted
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
    $assignedToMe: String,
    $closeDateType: String) {
    growthHacksPriorityMatrix(
      pipelineId: $pipelineId,
      search: $search,
      assignedUserIds: $assignedUserIds,
      closeDateType: $closeDateType
      assignedToMe: $assignedToMe
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
