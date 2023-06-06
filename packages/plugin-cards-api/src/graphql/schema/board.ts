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
  segmentData:String
`;

export const queries = `
  boards(type: String!): [Board]
  boardCounts(type: String!): [BoardCount]
  boardGetLast(type: String!): Board
  boardDetail(_id: String!): Board
  pipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [Pipeline]
  pipelineDetail(_id: String!): Pipeline
  pipelineAssignedUsers(_id: String!): [User]
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
  itemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  cardsFields: JSON
  boardContentTypeDetail(contentType: String, contentId: String): JSON
  boardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  checkFreeTimes(pipelineId: String, intervals: [Interval]): JSON
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
  isCheckUser: Boolean
  isCheckDepartment: Boolean
  excludeCheckUserIds: [String],
  numberConfig: String,
  numberSize: String,
  departmentIds: [String],
`;

export const mutations = `
  boardsAdd(${commonParams}): Board
  boardsEdit(_id: String!, ${commonParams}): Board
  boardsRemove(_id: String!): JSON
  boardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  boardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  pipelinesAdd(${commonParams}, ${pipelineParams}): Pipeline
  pipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): Pipeline
  pipelinesUpdateOrder(orders: [OrderItem]): [Pipeline]
  pipelinesWatch(_id: String!, isAdd: Boolean, type: String!): Pipeline
  pipelinesRemove(_id: String!): JSON
  pipelinesArchive(_id: String!): JSON  
  pipelinesCopied(_id: String!): JSON

  stagesUpdateOrder(orders: [OrderItem]): [Stage]
  stagesRemove(_id: String!): JSON
  stagesEdit(_id: String!, type: String, name: String, status: String): Stage
  stagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
