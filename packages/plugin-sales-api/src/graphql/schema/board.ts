const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = () => `

  type SalesBoard @key(fields: "_id") {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [SalesPipeline]
  }

  type SalesPipeline @key(fields: "_id") {
    _id: String!
    name: String!
    status: String
    boardId: String!
    tagId: String
    tag: Tag
    visibility: String!
    memberIds: [String]
    departmentIds: [String]
    branchIds: [String]
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
    nameConfig: String
    initialCategoryIds: [String]
    excludeCategoryIds: [String]
    excludeProductIds: [String]
    paymentIds: [String]
    paymentTypes: JSON
    erxesAppToken: String
    ${commonTypes}
  }

  type SalesStage @key(fields: "_id") {
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
    stayedDealsTotalCount: Int
    initialDealsTotalCount: Int
    inProcessDealsTotalCount: Int
    formId: String
    age: Int
    defaultTick: Boolean
    ${commonTypes}
  }

  type SalesPipelineChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type SalesProductsDataChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type SalesConvertTo {
    dealUrl: String,
  }

  type SalesBoardCount {
    _id: String
    name: String
    count: Int
  }

  input SalesItemDate {
    month: Int
    year: Int
  }

  input SalesInterval {
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
  salesBoards(type: String!): [SalesBoard]
  salesBoardCounts(type: String!): [SalesBoardCount]
  salesBoardGetLast(type: String!): SalesBoard
  salesBoardDetail(_id: String!): SalesBoard
  salesPipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [SalesPipeline]
  salesPipelineDetail(_id: String!): SalesPipeline
  salesPipelineAssignedUsers(_id: String!): [User]
  salesStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [SalesStage]
  salesStageDetail(_id: String!, ${stageParams}): SalesStage
  salesConvertToInfo(conversationId: String!): SalesConvertTo
  salesPipelineStateCount(boardId: String, type: String): JSON
  salesArchivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [SalesStage]
  salesArchivedStagesCount(pipelineId: String!, search: String): Int
  salesItemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  salesItemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  salesCardsFields: JSON
  salesBoardContentTypeDetail(contentType: String, contentId: String): JSON
  salesBoardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  salesCheckFreeTimes(pipelineId: String, intervals: [SalesInterval]): JSON
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
  nameConfig: String,
  departmentIds: [String],
  branchIds: [String],
  initialCategoryIds: [String]
  excludeCategoryIds: [String]
  excludeProductIds: [String]
  paymentIds: [String]
  paymentTypes: JSON
  erxesAppToken: String
`;

export const mutations = `
  salesBoardsAdd(${commonParams}): SalesBoard
  salesBoardsEdit(_id: String!, ${commonParams}): SalesBoard
  salesBoardsRemove(_id: String!): JSON
  salesBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  salesBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  salesPipelinesAdd(${commonParams}, ${pipelineParams}): SalesPipeline
  salesPipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): SalesPipeline
  salesPipelinesUpdateOrder(orders: [SalesOrderItem]): [SalesPipeline]
  salesPipelinesWatch(_id: String!, isAdd: Boolean, type: String!): SalesPipeline
  salesPipelinesRemove(_id: String!): JSON
  salesPipelinesArchive(_id: String!): JSON
  salesPipelinesCopied(_id: String!): JSON

  salesStagesUpdateOrder(orders: [SalesOrderItem]): [SalesStage]
  salesStagesRemove(_id: String!): JSON
  salesStagesEdit(_id: String!, type: String, name: String, status: String): SalesStage
  salesStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
