export const types = `

  type SalesBoard @key(fields: "_id") {
    _id: String!
    name: String!
    order: Int
    createdAt: Date
    type: String
    pipelines: [SalesPipeline]
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
`;

export const queries = `
  salesBoards: [SalesBoard]
  salesBoardCounts: [SalesBoardCount]
  salesBoardGetLast: SalesBoard
  salesBoardDetail(_id: String!): SalesBoard
  salesConvertToInfo(conversationId: String!): SalesConvertTo
  salesItemsCountByAssignedUser(pipelineId: String!, stackBy: String): JSON
  salesCardsFields: JSON
  salesBoardContentTypeDetail(contentType: String, contentId: String): JSON
  salesBoardLogs(action: String, content:JSON, contentId: String): JSON
  salesCheckFreeTimes(pipelineId: String, intervals: [SalesInterval]): JSON
`;

const mutationParams = `
  name: String!
`;

export const mutations = `
  salesBoardsAdd(${mutationParams}): SalesBoard
  salesBoardsEdit(_id: String!, ${mutationParams}): SalesBoard
  salesBoardsRemove(_id: String!): JSON
  salesBoardItemUpdateTimeTracking(_id: String!, status: String!, timeSpent: Int!, startDate: String): JSON
  salesBoardItemsSaveForGanttTimeline(items: JSON, links: JSON): String
`;
