export const types = `
  input TicketReportFilter {
    date: String
    fromDate: String
    toDate: String
    status: String
    source: String
    limit: Int
    page: Int
    channelIds: [String]
    memberIds: [String]
    pipelineIds: [String]
    tagIds: [String]
    state: String
    priority: [Int]
    startDate: String
    targetDate: String
    companyIds: [String]
    customerIds: [String]
    frequency: String
    branchIds: [String]
  }

  type ReportTicketMetric {
    count: Int
    percentage: Int
  }

  type ReportTicketSource {
    _id: String
    name: String
    count: Int
    percentage: Int
  }

  type ReportTicketTag {
    _id: String
    name: String
    count: Int
    percentage: Int
    colorCode: String
  }

  type TicketDateStat {
    date: String
    count: Int
  }

  type TicketListResult {
    list: [Ticket]
    totalCount: Int
    page: Int
    totalPages: Int
  }

  type ReportTicketStatusSummary {
    statusType: Int
    name: String
    color: String
    count: Int
    percentage: Int
  }
  type ReportTicketPriority {
    priority: Int
    name: String
    color: String
    count: Int
    percentage: Int
  }

  type TicketExportItem {
    _id: String
    name: String
    state: String
    priorityLabel: String
    statusLabel: String
    assigneeName: String
    pipelineName: String
    tagNames: [String]
    createdAt: Date
    startDate: Date
    targetDate: Date
    updatedAt: Date
  }
`;

export const queries = `
  reportTicketSource(filters: TicketReportFilter): [ReportTicketSource]
  reportTicketDate(filters: TicketReportFilter): [TicketDateStat]
  reportTicketOpen(filters: TicketReportFilter): ReportTicketMetric
  reportTicketList(filters: TicketReportFilter): TicketListResult
  reportTicketTags(filters: TicketReportFilter): [ReportTicketTag]
  reportTicketTotalCount(filters: TicketReportFilter): Int
  reportTicketStatusSummary(filters: TicketReportFilter): [ReportTicketStatusSummary]
  reportTicketPriority(filters: TicketReportFilter): [ReportTicketPriority]
  reportTicketExport(filters: TicketReportFilter): [TicketExportItem]
`;
