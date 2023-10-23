export const types = `
  type Report {
    _id: String!
    name: String
    visibility: VisibilityType
    memberIds: [String]
    tagIds: [String]
    createdAt:Date
  }

  enum VisibilityType {
    public
    private
  }
 
  type Chart {
    name: String
    reportId: String!
    contentType: String
    template: String
    order: Int
    chartType: ChartType
    filters: [ChartFilter]
    defaultFilter: ChartFilter
  }

  enum ChartType {
    pie
    line
    bar
  }

  type ChartFilter {
    fieldName: String
    filterValue: String
    filterType: FilterType
  }

  enum FilterType {
    DATE
    STRING
    NUMBER
  }

  type ReportsListResponse {
    reports: [Report]
    totalCount: Int
  }

  type ChartsListResponse {
    charts: [Chart]
    totalCount: Int
  }
`;

export const queries = `
  reportsList(typeId: String): ReportsListResponse
  reportDetail(reportId: String!): Report
  chartsList: ChartsListResponse
  chartDetail(chartId: String!): Chart
`;

export const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const chart_params = `
  order: Int
`;

export const mutations = `
  reportsAdd(${params}): Report
  reportsRemove(_id: String!): JSON
  reportsEdit(_id:String!, ${params}): Report

  chartsAdd(${chart_params}): Chart
  chartsRemove(_id: String!): JSON
  chartsEdit(_id: String, ${chart_params}): Chart
`;
