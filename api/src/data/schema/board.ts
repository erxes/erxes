const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = `
  type Board {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [Pipeline]
  }

  type Pipeline {
    _id: String!
    name: String!
    boardId: String!
    visibility: String!
    memberIds: [String]
    members: [User]
    bgColor: String
    isWatched: Boolean
    itemsTotalCount: Int

    startDate: Date
    endDate: Date
    metric: String
    hackScoringType: String
    templateId: String
    state: String
    isCheckUser: Boolean
    excludeCheckUserIds: [String]
    ${commonTypes}
  }

  type Stage {
    _id: String!
    name: String!
    pipelineId: String!
    probability: String
    status: String
    amount: JSON
    itemsTotalCount: Int
    compareNextStage: JSON
    stayedDealsTotalCount: Int
    initialDealsTotalCount: Int
    inProcessDealsTotalCount: Int
    formId: String
    ${commonTypes}
  }

  type PipelineChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type ConvertTo {
    ticketUrl: String,
    dealUrl: String,
    taskUrl: String,
  }

  type BoardCount {
    _id: String
    name: String
    count: Int
  }

  input ItemDate {
    month: Int
    year: Int
  }
`;

const stageParams = `
  search: String,
  companyIds: [String]
  customerIds: [String]
  assignedUserIds: [String]
  labelIds: [String]
  extraParams: JSON,
  closeDateType: String
`;

export const queries = `
  boards(type: String!): [Board]
  boardCounts(type: String!): [BoardCount]
  boardGetLast(type: String!): Board
  boardDetail(_id: String!): Board
  pipelines(boardId: String, type: String, page: Int, perPage: Int): [Pipeline]
  pipelineDetail(_id: String!): Pipeline
  stages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String!,
    ${stageParams}
  ): [Stage]
  stageDetail(_id: String!, ${stageParams}): Stage
  convertToInfo(conversationId: String!): ConvertTo
  pipelineStateCount(boardId: String, type: String): JSON
  archivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [Stage]
  archivedStagesCount(pipelineId: String!, search: String): Int
  itemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
`;

const commonParams = `
  name: String!,
  type: String!
`;

const pipelineParams = `
  name: String!,
  boardId: String!,
  type: String!,
  stages: JSON,
  visibility: String!,
  memberIds: [String],
  bgColor: String,
  startDate: Date,
  endDate: Date,
  metric: String,
  hackScoringType: String,
  templateId: String,
  isCheckUser: Boolean
  excludeCheckUserIds: [String],
`;

export const mutations = `
  boardsAdd(${commonParams}): Board
  boardsEdit(_id: String!, ${commonParams}): Board
  boardsRemove(_id: String!): JSON

  pipelinesAdd(${commonParams}, ${pipelineParams}): Pipeline
  pipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): Pipeline
  pipelinesUpdateOrder(orders: [OrderItem]): [Pipeline]
  pipelinesWatch(_id: String!, isAdd: Boolean, type: String!): Pipeline
  pipelinesRemove(_id: String!): JSON

  stagesUpdateOrder(orders: [OrderItem]): [Stage]
  stagesRemove(_id: String!): JSON
  stagesEdit(_id: String!, type: String, name: String, status: String): Stage
  stagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
