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
  dealBoards(type: String!): [Board]
  dealBoardCounts(type: String!): [BoardCount]
  dealBoardGetLast(type: String!): Board
  dealBoardDetail(_id: String!): Board
  dealPipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [Pipeline]
  dealPipelineDetail(_id: String!): Pipeline
  dealPipelineAssignedUsers(_id: String!): [User]
  dealStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [Stage]
  dealStageDetail(_id: String!, ${stageParams}): Stage
  dealConvertToInfo(conversationId: String!): ConvertTo
  dealPipelineStateCount(boardId: String, type: String): JSON
  dealArchivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [Stage]
  dealArchivedStagesCount(pipelineId: String!, search: String): Int
  dealItemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  dealItemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  dealCardsFields: JSON
  dealBoardContentTypeDetail(contentType: String, contentId: String): JSON
  dealBoardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  dealCheckFreeTimes(pipelineId: String, intervals: [Interval]): JSON
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
  dealBoardsAdd(${commonParams}): Board
  dealBoardsEdit(_id: String!, ${commonParams}): Board
  dealBoardsRemove(_id: String!): JSON
  dealBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  dealBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  dealPipelinesAdd(${commonParams}, ${pipelineParams}): Pipeline
  dealPipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): Pipeline
  dealPipelinesUpdateOrder(orders: [OrderItem]): [Pipeline]
  dealPipelinesWatch(_id: String!, isAdd: Boolean, type: String!): Pipeline
  dealPipelinesRemove(_id: String!): JSON
  dealPipelinesArchive(_id: String!): JSON
  dealPipelinesCopied(_id: String!): JSON

  dealStagesUpdateOrder(orders: [OrderItem]): [Stage]
  dealStagesRemove(_id: String!): JSON
  dealStagesEdit(_id: String!, type: String, name: String, status: String): Stage
  dealStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
