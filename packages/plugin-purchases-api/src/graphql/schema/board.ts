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
  purchaseBoards(type: String!): [Board]
  purchaseBoardCounts(type: String!): [BoardCount]
  purchaseBoardGetLast(type: String!): Board
  purchaseBoardDetail(_id: String!): Board
  purchasePipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [Pipeline]
  purchasePipelineDetail(_id: String!): Pipeline
  purchasePipelineAssignedUsers(_id: String!): [User]
  purchaseStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [Stage]
  purchaseStageDetail(_id: String!, ${stageParams}): Stage
  purchaseConvertToInfo(conversationId: String!): ConvertTo
  purchasePipelineStateCount(boardId: String, type: String): JSON
  purchaseArchivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [Stage]
  purchaseArchivedStagesCount(pipelineId: String!, search: String): Int
  purchaseItemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  purchaseItemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  purchaseCardsFields: JSON
  purchaseBoardContentTypeDetail(contentType: String, contentId: String): JSON
  purchaseBoardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  purchaseCheckFreeTimes(pipelineId: String, intervals: [Interval]): JSON
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
  purchaseBoardsAdd(${commonParams}): Board
  purchaseBoardsEdit(_id: String!, ${commonParams}): Board
  purchaseBoardsRemove(_id: String!): JSON
  purchaseBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  purchaseBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  purchasePipelinesAdd(${commonParams}, ${pipelineParams}): Pipeline
  purchasePipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): Pipeline
  purchasePipelinesUpdateOrder(orders: [OrderItem]): [Pipeline]
  purchasePipelinesWatch(_id: String!, isAdd: Boolean, type: String!): Pipeline
  purchasePipelinesRemove(_id: String!): JSON
  purchasePipelinesArchive(_id: String!): JSON
  purchasePipelinesCopied(_id: String!): JSON

  purchaseStagesUpdateOrder(orders: [OrderItem]): [Stage]
  purchaseStagesRemove(_id: String!): JSON
  purchaseStagesEdit(_id: String!, type: String, name: String, status: String): Stage
  purchaseStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
