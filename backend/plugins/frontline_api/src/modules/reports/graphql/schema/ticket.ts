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
`;

export const queries = `
  reportTicketSource(filters: TicketReportFilter): [ReportTicketSource]
  reportTicketOpenDate(filters: TicketReportFilter): [TicketDateStat]
  reportTicketOpen(filters: TicketReportFilter): ReportTicketMetric
  reportTicketList(filters: TicketReportFilter): TicketListResult
  reportTicketTags(filters: TicketReportFilter): [ReportTicketTag]
`;
