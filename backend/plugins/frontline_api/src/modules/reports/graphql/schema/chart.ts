export const types = `
  type ReportChartPropertyValueFilter {
    propertyId: String
    type: String
    values: [String]
  }

  type ReportChartFilters {
    date: String
    fromDate: String
    toDate: String
    status: String
    source: String
    state: String
    frequency: String
    startDate: String
    targetDate: String
    groupPropertyId: String
    channelIds: [String]
    memberIds: [String]
    pipelineIds: [String]
    tagIds: [String]
    customerIds: [String]
    companyIds: [String]
    branchIds: [String]
    propertyIds: [String]
    priority: [Int]
    propertyValueFilters: [ReportChartPropertyValueFilter]
  }

  type ReportChart {
    _id: String!
    name: String
    chartType: String
    visualType: String
    colSpan: Int
    filters: ReportChartFilters
    createdBy: String
    createdAt: Date
    updatedAt: Date
  }
`;

export const queries = `
  reportCharts(chartType: String): [ReportChart]
  reportChartDetail(_id: String!): ReportChart
`;

export const mutations = `
  reportChartAdd(
    name: String!
    chartType: String!
    visualType: String
    colSpan: Int
    filters: TicketReportFilter
  ): ReportChart
  reportChartEdit(
    _id: String!
    name: String
    visualType: String
    colSpan: Int
    filters: TicketReportFilter
  ): ReportChart
  reportChartRemove(_id: String!): ReportChart
`;
