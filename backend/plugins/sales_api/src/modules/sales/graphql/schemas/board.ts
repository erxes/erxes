export const types = `

  type SalesBoard @key(fields: "_id") {
    _id: String!
    name: String!
    order: Int
    createdAt: Date
    type: String
    status: String
    pipelines: [SalesPipeline]
  }

  type SalesBoardArchivePreview {
    pipelineCount: Int!
    dealCount: Int!
    automationCount: Int!
    posCount: Int!
    paymentCount: Int!
  }

  type SalesConvertTo {
    dealUrl: String
  }

  type SalesBoardCount {
    _id: String
    name: String
    count: Int
  }

  input SalesInterval {
    startTime: Date
    endTime: Date
  }

  type SalesPipelineChangeResponse {
    _id: String
    processId: String
    action: String
    data: JSON
  }
`;

export const queries = `
  salesBoards(includeArchived: Boolean): [SalesBoard]
  salesBoardArchivePreview(_id: String!): SalesBoardArchivePreview!
  cpSalesBoards: [SalesBoard]
  salesBoardCounts: [SalesBoardCount]
  salesBoardGetLast: SalesBoard
  salesBoardDetail(_id: String!): SalesBoard
  cpSalesBoardDetail(_id: String!): SalesBoard
  salesConvertToInfo(conversationId: String!): SalesConvertTo
  salesItemsCountByAssignedUser(pipelineId: String!, stackBy: String): JSON
  salesCardsFields: JSON
  salesBoardContentTypeDetail(contentType: String, contentId: String): JSON
  salesBoardLogs(action: String, content:JSON, contentId: String): JSON
  salesCheckFreeTimes(pipelineId: String, intervals: [SalesInterval]): JSON
  cpSalesCheckFreeTimes(pipelineId: String, intervals: [SalesInterval]): JSON
`;

const mutationParams = `
  name: String!
`;

export const mutations = `
  salesBoardsAdd(${mutationParams}): SalesBoard
  salesBoardsEdit(_id: String!, ${mutationParams}): SalesBoard
  salesBoardsRemove(_id: String!): JSON
  salesBoardsArchive(_id: String!, acknowledgeAutomations: Boolean, acknowledgeConnections: Boolean): SalesBoard!
  salesBoardsUnarchive(_id: String!): SalesBoard!
  salesBoardItemUpdateTimeTracking(_id: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  salesBoardItemsSaveForGanttTimeline(items: JSON, links: JSON): String
`;
