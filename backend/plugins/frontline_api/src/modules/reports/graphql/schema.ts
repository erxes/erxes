export const types = `
  input ConversationReportFilter {
    status: String
    limit: Int
  }

  type ReportMetric {
    count: Int
    percentage: Int
  }

  type ReportSource {
    _id: String
    name: String
    count: Int
    percentage: Int
  }

  type ConversationListResult {
  list: [Conversation]
  totalCount: Int
  page: Int
  totalPages: Int
}
  type ConversationResponseMetric {
    totalResponses: Int
    avgResponseTime: Int
    responseRate: Float
    count: Int
  }
`;

export const queries = `
  reportConversationList(filters: ConversationReportFilter): ConversationListResult
  reportConversationResponses(filters: ConversationReportFilter): ConversationResponseMetric
  reportConversationOpen(filters: ConversationReportFilter): ReportMetric
  reportConversationClosed(filters: ConversationReportFilter): ReportMetric
  reportConversationResolved(filters: ConversationReportFilter): ReportMetric
  reportConversationTags(filters: ConversationReportFilter): [ReportSource]
  reportConversationSources(filters: ConversationReportFilter): [ReportSource]
`;
