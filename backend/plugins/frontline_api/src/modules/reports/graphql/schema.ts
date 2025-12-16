export const types = `
  type ReportMetric {
    count: Int
    percentage: Int
  }

  type ReportSource {
    name: String
    count: Int
    percentage: Int
  }

  type ReportChartResult {
    ConversationOpen: ReportMetric
    ConversationClosed: ReportMetric
    ConversationResolved: ReportMetric
    ConversationSources: [ReportSource]
    ConversationTag: [ReportSource]
  }
`;

export const queries = `
  chartGetResult: ReportChartResult
`;
