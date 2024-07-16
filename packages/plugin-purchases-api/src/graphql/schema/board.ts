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
    purchasesPipelines: [PurchasePipeline]
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

  input PurchasesItemDate {
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
  purchasesBoards(type: String!): [PurchaseBoard]
  boardCounts(type: String!): [PurchaseBoardCount]
  boardGetLast(type: String!): PurchaseBoard
  boardDetail(_id: String!): PurchaseBoard
  purchasesPipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [PurchasePipeline]
  pipelineDetail(_id: String!): PurchasePipeline
  pipelineAssignedUsers(_id: String!): [User]
  purchasesStages(
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
  purchasesStages: JSON,
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
  purchasesBoardsAdd(${commonParams}): PurchaseBoard
  purchasesBoardsEdit(_id: String!, ${commonParams}): PurchaseBoard
  purchasesBoardsRemove(_id: String!): JSON
  purchasesBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  purchasesBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  purchasesPipelinesAdd(${commonParams}, ${pipelineParams}): PurchasePipeline
  purchasesPipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): PurchasePipeline
  purchasesPipelinesUpdateOrder(orders: [PurchasesOrderItem]): [PurchasePipeline]
  purchasesPipelinesWatch(_id: String!, isAdd: Boolean, type: String!): PurchasePipeline
  purchasesPipelinesRemove(_id: String!): JSON
  purchasesPipelinesArchive(_id: String!): JSON
  purchasesPipelinesCopied(_id: String!): JSON

  purchasesStagesUpdateOrder(orders: [PurchasesOrderItem]): [PurchaseStage]
  purchasesStagesRemove(_id: String!): JSON
  purchasesStagesEdit(_id: String!, type: String, name: String, status: String): PurchaseStage
  purchasesStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
