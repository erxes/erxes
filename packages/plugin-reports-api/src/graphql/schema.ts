export const types = `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Report {
    _id: String!
    name: String
    visibility: VisibilityType
    memberIds: [String]
    tagIds: [String]
    charts: [Chart]
    
    lastUpdatedAt:Date
    createdAt:Date
    createdBy: User
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
    list: [Report]
    totalCount: Int
  }

  type ChartsListResponse {
    charts: [Chart]
    totalCount: Int
  }
`;

const query_params = `
  userId: String`;

export const queries = `
  reportsList(${query_params}): ReportsListResponse
  reportDetail(reportId: String!): Report
  chartsList: ChartsListResponse
  chartDetail(chartId: String!): Chart
  reportChartGetResult(chartId: String!): Chart
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
