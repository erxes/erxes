export const types = `
  input ConversationReportFilter {
    date: String
    fromDate: String
    toDate: String
    status: String
    source: String
    callStatus: String
    limit: Int
    page: Int
    channelIds: [String]
    memberIds: [String]
  }

 type ConversationTemplateType{
      _id: String
      name: String
      content: String
      usageCount: Int
      lastUsed: String
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
  type ReportTag {
    _id: String
    name: String
    count: Int
    percentage: Int
    colorCode: String
  }

  type ConversationDateStat {
    date: String
    count: Int
  }

 type ConversationTemplateStat {
    template: ConversationTemplateType
    usageCount: Int
}

  type ConversationListResult {
  list: [Conversation]
  totalCount: Int
  page: Int
  totalPages: Int
}
  type ConversationUserMessageStat {
    user: User
    messageCount: Int
  }

  type ConversationMemberProgress {
    assigneeId: String!
    new: Int!
    open: Int!
    closed: Int!
    resolved: Int!
  }

  type ConversationChartDataPoint {
    date: String!
    new: Int!
    open: Int!
    closed: Int!
    resolved: Int!
  }

  type ConversationProgressChart {
    total: Int!
    chartData: [ConversationChartDataPoint!]!
  }

  type ConversationSourceProgressItem {
    source: String!
    count: Int!
  }

  type ConversationSourceProgress {
    new: [ConversationSourceProgressItem!]!
    open: [ConversationSourceProgressItem!]!
    closed: [ConversationSourceProgressItem!]!
    resolved: [ConversationSourceProgressItem!]!
  }

  type ConversationTagProgressItem {
    tagId: String!
    count: Int!
  }

  type ConversationTagProgress {
    new: [ConversationTagProgressItem!]!
    open: [ConversationTagProgressItem!]!
    closed: [ConversationTagProgressItem!]!
    resolved: [ConversationTagProgressItem!]!
  }

`;

export const queries = `
  conversationProgressChart(customerId:String!): ConversationProgressChart
  conversationMemberProgress(customerId:String!):[ConversationMemberProgress]
  conversationSourceProgress(customerId:String!): ConversationSourceProgress
  conversationTagProgress(customerId:String!): ConversationTagProgress
  reportConversationOpenDate(filters: ConversationReportFilter): [ConversationDateStat]
  reportConversationResolvedDate(filters: ConversationReportFilter): [ConversationDateStat]
  reportConversationList(filters: ConversationReportFilter): ConversationListResult
  reportConversationResponses(filters: ConversationReportFilter): [ConversationUserMessageStat]
  reportConversationOpen(filters: ConversationReportFilter): ReportMetric
  reportConversationClosed(filters: ConversationReportFilter): ReportMetric
  reportConversationResolved(filters: ConversationReportFilter): ReportMetric
  reportConversationTags(filters: ConversationReportFilter): [ReportTag]
  reportConversationSources(filters: ConversationReportFilter): [ReportSource]
`;
