const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = ({ tags }) => `

  type PurchaseBoard @key(fields: "_id") {
    _id: String!
    name: String!
    ${commonTypes}
    purchasePipelines: [PurchasePipeline]
  }

  type PurchasePipeline @key(fields: "_id") {
    _id: String!
    name: String!
    status: String
    boardId: String!
    tagId: String
    ${tags ? `tag: Tag` : ""}
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

  type PurchaseStage @key(fields: "_id") {
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
    stayedPurchasesTotalCount: Int
    initialPurchasesTotalCount: Int
    inProcessPurchasesTotalCount: Int
    formId: String
    age: Int
    defaultTick: Boolean
    ${commonTypes}
  }

  type PurchasePipelineChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type PurchaseProductsDataChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type PurchaseConvertTo {
    purchaseUrl:String,
  }

  type PurchaseBoardCount {
    _id: String
    name: String
    count: Int
  }

  input PurchaseItemDate {
    month: Int
    year: Int
  }

  input PurchaseInterval {
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
  purchaseBoards(type: String!): [PurchaseBoard]
  boardCounts(type: String!): [PurchaseBoardCount]
  boardGetLast(type: String!): PurchaseBoard
  boardDetail(_id: String!): PurchaseBoard
  purchasePipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [PurchasePipeline]
  pipelineDetail(_id: String!): PurchasePipeline
  pipelineAssignedUsers(_id: String!): [User]
  purchaseStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [PurchaseStage]
  stageDetail(_id: String!, ${stageParams}): PurchaseStage
  convertToInfo(conversationId: String!): PurchaseConvertTo
  pipelineStateCount(boardId: String, type: String): JSON
  archivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [PurchaseStage]
  archivedStagesCount(pipelineId: String!, search: String): Int
  itemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  itemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  cardsFields: JSON
  boardContentTypeDetail(contentType: String, contentId: String): JSON
  boardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  checkFreeTimes(pipelineId: String, intervals: [PurchaseInterval]): JSON
`;

const commonParams = `
  name: String!,
  type: String!
`;

const pipelineParams = `
  name: String!,
  boardId: String!,
  type: String!,
  purchaseStages: JSON,
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
  purchaseBoardsAdd(${commonParams}): PurchaseBoard
  purchaseBoardsEdit(_id: String!, ${commonParams}): PurchaseBoard
  purchaseBoardsRemove(_id: String!): JSON
  purchaseBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  purchaseBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  purchasePipelinesAdd(${commonParams}, ${pipelineParams}): PurchasePipeline
  purchasePipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): PurchasePipeline
  purchasePipelinesUpdateOrder(orders: [OrderItem]): [PurchasePipeline]
  purchasePipelinesWatch(_id: String!, isAdd: Boolean, type: String!): PurchasePipeline
  purchasePipelinesRemove(_id: String!): JSON
  purchasePipelinesArchive(_id: String!): JSON
  purchasePipelinesCopied(_id: String!): JSON

  purchaseStagesUpdateOrder(orders: [OrderItem]): [PurchaseStage]
  purchaseStagesRemove(_id: String!): JSON
  purchaseStagesEdit(_id: String!, type: String, name: String, status: String): PurchaseStage
  purchaseStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
