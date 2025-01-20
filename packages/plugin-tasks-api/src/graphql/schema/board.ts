const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = () => `

  type TasksBoard @key(fields: "_id") {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [TasksPipeline]
  }

  type TasksPipeline @key(fields: "_id") {
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

  type TasksStage @key(fields: "_id") {
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
    compareNextStageTasks: JSON
    stayedTasksTotalCount: Int
    initialTasksTotalCount: Int
    inProcessTasksTotalCount: Int
    formId: String
    age: Int
    defaultTick: Boolean
    ${commonTypes}
  }

  type TasksPipelineChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type TasksProductsDataChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type TasksConvertTo {
    taskUrl:String,
  }

  type TasksBoardCount {
    _id: String
    name: String
    count: Int
  }

  input TasksItemDate {
    month: Int
    year: Int
  }

  input TasksInterval {
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
  tasksBoards(type: String!): [TasksBoard]
  tasksBoardCounts(type: String!): [TasksBoardCount]
  tasksBoardGetLast(type: String!): TasksBoard
  tasksBoardDetail(_id: String!): TasksBoard
  tasksPipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [TasksPipeline]
  tasksPipelineDetail(_id: String!): TasksPipeline
  tasksPipelineAssignedUsers(_id: String!): [User]
  tasksStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [TasksStage]
  tasksStageDetail(_id: String!, ${stageParams}): TasksStage
  tasksConvertToInfo(conversationId: String!): TasksConvertTo
  tasksPipelineStateCount(boardId: String, type: String): JSON
  tasksArchivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [TasksStage]
  tasksArchivedStagesCount(pipelineId: String!, search: String): Int
  tasksItemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  tasksItemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  tasksCardsFields: JSON
  tasksBoardContentTypeDetail(contentType: String, contentId: String): JSON
  tasksBoardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  tasksCheckFreeTimes(pipelineId: String, intervals: [TasksInterval]): JSON
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
`;

export const mutations = `
  tasksBoardsAdd(${commonParams}): TasksBoard
  tasksBoardsEdit(_id: String!, ${commonParams}): TasksBoard
  tasksBoardsRemove(_id: String!): JSON
  tasksBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  tasksBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  tasksPipelinesAdd(${commonParams}, ${pipelineParams}): TasksPipeline
  tasksPipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): TasksPipeline
  tasksPipelinesUpdateOrder(orders: [TasksOrderItem]): [TasksPipeline]
  tasksPipelinesWatch(_id: String!, isAdd: Boolean, type: String!): TasksPipeline
  tasksPipelinesRemove(_id: String!): JSON
  tasksPipelinesArchive(_id: String!): JSON
  tasksPipelinesCopied(_id: String!): JSON

  tasksStagesUpdateOrder(orders: [TasksOrderItem]): [TasksStage]
  tasksStagesRemove(_id: String!): JSON
  tasksStagesEdit(_id: String!, type: String, name: String, status: String): TasksStage
  tasksStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
