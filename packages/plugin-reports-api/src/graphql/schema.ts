export const types = `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Report {
    _id: String!
    name: String
    visibility: VisibilityType
    selectedMemberIds: [String]
    departmentIds: [String]
    tagIds: [String]
    charts: [ReportChart]
    
    lastUpdatedAt:Date
    lastUpdatedBy: User
    createdAt:Date
    createdBy: User
  }

  enum VisibilityType {
    public
    private
  }

  type ReportTemplate {
    templateType: String
    name: String!
    description: String
    filterTypes: [ReportFilter]
  }

  type ReportFilter {
    fieldName: String
    fieldType: String
    multi: Boolean
    fieldQuery: String
    fieldLabel: String
  }
 
  type ReportChart {
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
    charts: [ReportChart]
    totalCount: Int
  }
`;

const query_params = `
  userId: String`;

export const queries = `
  reportsList: ReportsListResponse
  reportDetail(reportId: String!): Report
  
  reportChartsList: ChartsListResponse
  reportChartDetail(chartId: String!): ReportChart
  reportTemplatesList(searchValue: String): [JSON]  

  reportChartGetTemplates(serviceName: String!): JSON
  reportChartGetFilterTypes(serviceName: String!, templateType: String!): JSON
  reportChartGetResult(serviceName: String!, templateType: String!, filter: JSON): JSON
  
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
  reportsRemoveMany(ids: [String]!): JSON 
   
  reportsEdit(_id:String!, ${params}): Report

  reportChartsAdd(${chart_params}): ReportChart
  reportChartsRemove(_id: String!): JSON
  reportChartsEdit(_id: String, ${chart_params}): ReportChart
`;
