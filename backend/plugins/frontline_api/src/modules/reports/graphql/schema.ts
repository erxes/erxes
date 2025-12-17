export const types = `
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

  type ConversationSourcesResult {
    topPerforming: [ReportSource]
    topConverting: [ReportSource]
  }

  type ReportChartResult {
    ConversationOpen: ReportMetric
    ConversationClosed: ReportMetric
    ConversationResolved: ReportMetric
    ConversationSources: ConversationSourcesResult
    ConversationTag: [ReportSource]
  }
`;

export const queries = `
  chartGetResult: ReportChartResult
`;
