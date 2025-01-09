const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = () => `

  type TicketsBoard @key(fields: "_id") {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [TicketsPipeline]
  }

  type TicketsPipeline @key(fields: "_id") {
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

  type TicketsStage @key(fields: "_id") {
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
    compareNextStageTickets: JSON
    stayedTicketsTotalCount: Int
    initialTicketsTotalCount: Int
    inProcessTicketsTotalCount: Int
    formId: String
    age: Int
    defaultTick: Boolean
    ${commonTypes}
  }

  type TicketsPipelineChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type TicketsProductsDataChangeResponse {
    _id: String
    proccessId: String
    action: String
    data: JSON
  }

  type TicketsConvertTo {
    ticketUrl: String
  }

  type TicketsBoardCount {
    _id: String
    name: String
    count: Int
  }

  input TicketsItemDate {
    month: Int
    year: Int
  }

  input TicketsInterval {
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
  ticketsBoards(type: String!): [TicketsBoard]
  ticketsBoardCounts(type: String!): [TicketsBoardCount]
  ticketsBoardGetLast(type: String!): TicketsBoard
  ticketsBoardDetail(_id: String!): TicketsBoard
  ticketsPipelines(boardId: String, type: String, isAll: Boolean, page: Int, perPage: Int): [TicketsPipeline]
  ticketsPipelineDetail(_id: String!): TicketsPipeline
  ticketsPipelineAssignedUsers(_id: String!): [User]
  ticketsStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${stageParams}
  ): [TicketsStage]
  ticketsStageDetail(_id: String!, ${stageParams}): TicketsStage
  ticketsConvertToInfo(conversationId: String!): TicketsConvertTo
  ticketsPipelineStateCount(boardId: String, type: String): JSON
  ticketsArchivedStages(pipelineId: String!, search: String, page: Int, perPage: Int): [TicketsStage]
  ticketsArchivedStagesCount(pipelineId: String!, search: String): Int
  ticketsItemsCountBySegments(type: String!, boardId: String, pipelineId: String): JSON
  ticketsItemsCountByAssignedUser(type: String!, pipelineId: String!, stackBy: String): JSON
  ticketsCardsFields: JSON
  ticketsBoardContentTypeDetail(contentType: String, contentId: String): JSON
  ticketsBoardLogs(action: String, content:JSON, contentId: String, contentType: String): JSON
  ticketsCheckFreeTimes(pipelineId: String, intervals: [TicketsInterval]): JSON
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
  ticketsBoardsAdd(${commonParams}): TicketsBoard
  ticketsBoardsEdit(_id: String!, ${commonParams}): TicketsBoard
  ticketsBoardsRemove(_id: String!): JSON
  ticketsBoardItemUpdateTimeTracking(_id: String!, type: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  ticketsBoardItemsSaveForGanttTimeline(items: JSON, links: JSON, type: String!): String

  ticketsPipelinesAdd(${commonParams}, ${pipelineParams}): TicketsPipeline
  ticketsPipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): TicketsPipeline
  ticketsPipelinesUpdateOrder(orders: [TicketsOrderItem]): [TicketsPipeline]
  ticketsPipelinesWatch(_id: String!, isAdd: Boolean, type: String!): TicketsPipeline
  ticketsPipelinesRemove(_id: String!): JSON
  ticketsPipelinesArchive(_id: String!): JSON
  ticketsPipelinesCopied(_id: String!): JSON

  ticketsStagesUpdateOrder(orders: [TicketsOrderItem]): [TicketsStage]
  ticketsStagesRemove(_id: String!): JSON
  ticketsStagesEdit(_id: String!, type: String, name: String, status: String): TicketsStage
  ticketsStagesSortItems(stageId: String!, type: String, proccessId: String, sortType: String): String
`;
