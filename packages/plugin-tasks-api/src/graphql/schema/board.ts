const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = ({ tags }) => `

  type Board @key(fields: "_id") {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [Pipeline]
  }

  type Pipeline @key(fields: "_id") {
    _id: String!
    name: String!
    status: String
    boardId: String!
    tagId: String
    ${tags ? `tag: Tag` : ''}
    visibility: String!
    memberIds: [String]
    departmentIds: [String]
    members: [User]
    bgColor: String
    isWatched: Boolean
    itemsTotalCount: Int
    userId: String
    createdUser: User
    startDate: Date
    endDate: Date
    metric: String
    hackScoringType: String
    templateId: String
    state: String
    isCheckDate: Boolean
    isCheckUser: Boolean
    isCheckDepartment: Boolean
    excludeCheckUserIds: [String]
    numberConfig: String
    numberSize: String
    ${commonTypes}
  }

  type Stage @key(fields: "_id") {
    _id: String!
    name: String!
    pipelineId: String!
    visibility: String
    code: String
    memberIds: [String]
    canMoveMemberIds: [String]
    canEditMemberIds: [String]
    members: [User]
    departmentIds: [String]
    probability: String
    status: String
    unUsedAmount: JSON
    amount: JSON
    itemsTotalCount: Int
    compareNextStage: JSON
    compareNextStagePurchase: JSON
    stayedDealsTotalCount: Int
    initialDealsTotalCount: Int
    inProcessDealsTotalCount: Int
    stayedPurchasesTotalCount: Int
    initialPurchasesTotalCount: Int
    inProcessPurchasesTotalCount: Int
    formId: String
    age: Int
    defaultTick: Boolean
    ${commonTypes}
  }

  type PipelineChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type ProductsDataChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type ConvertTo {
    ticketUrl: String,
    dealUrl: String,
    taskUrl: String,
    purchaseUrl:String,
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

  input Interval {
    startTime: Date
    endTime: Date
  }
`;

const stageParams = `
  search: String,
  companyIds: [String]
  customerIds: [String]
  assignedUserIds: [String]
  labelIds: [String]
  extraParams: JSON,
  closeDateType: String,
  assignedToMe: String,
  age: Int,
  branchIds: [String]
  departmentIds: [String]
  segment: String
  segmentData:String
  createdStartDate: Date
  createdEndDate: Date
  stateChangedStartDate: Date
  stateChangedEndDate: Date
  startDateStartDate: Date
  startDateEndDate: Date
  closeDateStartDate: Date
  closeDateEndDate: Date
`;

export const queries = `
  taskBoards(type: String!): [Board]
  taskBoardCounts(type: String!): [BoardCount]
  taskBoardGetLast(type: String!): Board
  taskBoardDetail(_id: String!): Board
  taskPipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [Pipeline]
  taskPipelineDetail(_id: String!): Pipeline
  taskPipelineAssignedUsers(_id: String!): [User]
  taskStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [Stage]
  taskStageDetail(_id: String!, ${stageParams}): Stage
  taskConvertToInfo(conversationId: String!): ConvertTo
  taskPipelineStateCount(boardId: String, type: String): JSON
  taskArchivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [Stage]
  taskArchivedStagesCount(pipelineId: String!, search: String): Int
  taskItemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  taskItemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  taskCardsFields: JSON
  taskBoardContentTypeDetail(contentType: String, contentId: String): JSON
  taskBoardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  taskCheckFreeTimes(pipelineId: String, intervals: [Interval]): JSON
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
  tagId: String,
  bgColor: String,
  startDate: Date,
  endDate: Date,
  metric: String,
  hackScoringType: String,
  templateId: String,
  isCheckDate: Boolean
  isCheckUser: Boolean
  isCheckDepartment: Boolean
  excludeCheckUserIds: [String],
  numberConfig: String,
  numberSize: String,
  departmentIds: [String],
`;

export const mutations = `
  taskBoardsAdd(${commonParams}): Board
  taskBoardsEdit(_id: String!, ${commonParams}): Board
  taskBoardsRemove(_id: String!): JSON
  taskBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  taskBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  taskPipelinesAdd(${commonParams}, ${pipelineParams}): Pipeline
  taskPipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): Pipeline
  taskPipelinesUpdateOrder(orders: [OrderItem]): [Pipeline]
  taskPipelinesWatch(_id: String!, isAdd: Boolean, type: String!): Pipeline
  taskPipelinesRemove(_id: String!): JSON
  taskPipelinesArchive(_id: String!): JSON
  taskPipelinesCopied(_id: String!): JSON

  taskStagesUpdateOrder(orders: [OrderItem]): [Stage]
  taskStagesRemove(_id: String!): JSON
  taskStagesEdit(_id: String!, type: String, name: String, status: String): Stage
  taskStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
