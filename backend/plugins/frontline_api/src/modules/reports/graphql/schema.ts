export const types = `
  input ConversationReportFilter {
    date: String
    fromDate: String
    toDate: String
    status: String
    limit: Int
    page: Int
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

`;

export const queries = `
  conversationProgressChart(customerId:String!):JSON
  conversationMemberProgress(customerId:String!):JSON
  conversationSourceProgress(customerId:String!):JSON
  conversationTagProgress(customerId:String!):JSON
  reportConversationResponseTemplate(filters: ConversationReportFilter): [ConversationTemplateStat]
  reportConversationOpenDate(filters: ConversationReportFilter): [ConversationDateStat]
  reportConversationResolvedDate(filters: ConversationReportFilter): [ConversationDateStat]
  reportConversationList(filters: ConversationReportFilter): ConversationListResult
  reportConversationResponses(filters: ConversationReportFilter): [ConversationUserMessageStat]
  reportConversationOpen(filters: ConversationReportFilter): ReportMetric
  reportConversationClosed(filters: ConversationReportFilter): ReportMetric
  reportConversationResolved(filters: ConversationReportFilter): ReportMetric
  reportConversationTags(filters: ConversationReportFilter): [ReportSource]
  reportConversationSources(filters: ConversationReportFilter): [ReportSource]
`;
