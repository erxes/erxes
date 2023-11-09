export const types = tagsAvailable => `
  
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  ${
    tagsAvailable
      ? `
      extend type Tag @key(fields: "_id"){
        _id: String! @external
      }
    `
      : ``
  }


  type Report {
    _id: String!
    name: String
    visibility: VisibilityType
    
    assignedUserIds: [String]
    assignedDepartmentIds: [String]
    tagIds: [String]
    
    members: [User]
    tags: [Tag]

    charts: [ReportChart]
    chartsCount: Int

    updatedAt:Date
    updatedBy: User

    createdAt:Date
    createdBy: User
  }

  enum VisibilityType {
    public
    private
  }

  type ReportTemplate {
    title: String
    description: String
    charts: [String]
    img: String
    serviceName: String
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

const queryParams = `
  searchValue: String
  perPage: Int
  page: Int
  departmentId: String
`;

export const queries = `
  reportsList(${queryParams}): ReportsListResponse
  reportDetail(reportId: String!): Report
  
  reportChartsList: ChartsListResponse
  reportChartDetail(chartId: String!): ReportChart
  reportTemplatesList(searchValue: String): [ReportTemplate]  
  reportChartTemplatesList(serviceName: String!, charts: [String]): [JSON] 

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
  reportId: String!
  order: Int
`;

const report_params = `
  name: String,
  visibility: VisibilityType,
  assignedUserIds: [String],
  assignedDepartmentIds: [String],
  tagIds: [String],
`;

export const mutations = `
  reportsAdd(${report_params}): Report
  reportsRemove(_id: String!): JSON
  reportsRemoveMany(ids: [String]!): JSON 
   
  reportsEdit(_id:String!, ${report_params}): Report

  reportChartsAdd(${chart_params}): ReportChart
  reportChartsRemove(_id: String!): JSON
  reportChartsEdit(_id: String, ${chart_params}): ReportChart
`;
