const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = () => `
  type PurchasesBoard @key(fields: "_id") {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [PurchasesPipeline]
  }

  type PurchasesPipeline @key(fields: "_id") {
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
    ${commonTypes}
  }

  type PurchasesStage @key(fields: "_id") {
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
    compareNextStagePurchases: JSON
    stayedPurchasesTotalCount: Int
    initialPurchasesTotalCount: Int
    inProcessPurchasesTotalCount: Int
    formId: String
    age: Int
    defaultTick: Boolean
    ${commonTypes}
  }

  type PurchasesPipelineChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type PurchasesProductsDataChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type PurchasesConvertTo {
    purchaseUrl: String
  }

  type PurchasesBoardCount {
    _id: String
    name: String
    count: Int
  }

  input PurchasesItemDate {
    month: Int
    year: Int
  }

  input PurchasesInterval {
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
  purchasesBoards(type: String!): [PurchasesBoard]
  purchasesBoardCounts(type: String!): [PurchasesBoardCount]
  purchasesBoardGetLast(type: String!): PurchasesBoard
  purchasesBoardDetail(_id: String!): PurchasesBoard
  purchasesPipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [PurchasesPipeline]
  purchasesPipelineDetail(_id: String!): PurchasesPipeline
  purchasesPipelineAssignedUsers(_id: String!): [User]
  purchasesStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [PurchasesStage]
  purchasesStageDetail(_id: String!, ${stageParams}): PurchasesStage
  purchasesConvertToInfo(conversationId: String!): PurchasesConvertTo
  purchasesPipelineStateCount(boardId: String, type: String): JSON
  purchasesArchivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [PurchasesStage]
  purchasesArchivedStagesCount(pipelineId: String!, search: String): Int
  purchasesItemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  purchasesItemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  purchasesCardsFields: JSON
  purchasesBoardContentTypeDetail(contentType: String, contentId: String): JSON
  purchasesBoardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  purchasesCheckFreeTimes(pipelineId: String, intervals: [PurchasesInterval]): JSON
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
  nameConfig: String,
  branchIds: [String],
`;

export const mutations = `
  purchasesBoardsAdd(${commonParams}): PurchasesBoard
  purchasesBoardsEdit(_id: String!, ${commonParams}): PurchasesBoard
  purchasesBoardsRemove(_id: String!): JSON
  purchasesBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  purchasesBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  purchasesPipelinesAdd(${commonParams}, ${pipelineParams}): PurchasesPipeline
  purchasesPipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): PurchasesPipeline
  purchasesPipelinesUpdateOrder(orders: [PurchasesOrderItem]): [PurchasesPipeline]
  purchasesPipelinesWatch(_id: String!, isAdd: Boolean, type: String!): PurchasesPipeline
  purchasesPipelinesRemove(_id: String!): JSON
  purchasesPipelinesArchive(_id: String!): JSON
  purchasesPipelinesCopied(_id: String!): JSON

  purchasesStagesUpdateOrder(orders: [PurchasesOrderItem]): [PurchasesStage]
  purchasesStagesRemove(_id: String!): JSON
  purchasesStagesEdit(_id: String!, type: String, name: String, status: String): PurchasesStage
  purchasesStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
