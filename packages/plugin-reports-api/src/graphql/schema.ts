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
    ${tagsAvailable ? 'tags: [Tag]' : ''}
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
    serviceType: String
    type: String
  }

  type ReportFilter {
    fieldName: String
    fieldType: String
    multi: Boolean
    fieldQuery: String
    fieldLabel: String
  }
 
  type ReportChart {
    _id: String
    name: String
    reportId: String!
    contentType: String
    serviceName: String
    templateType: String
    order: Int
    chartType: ChartType
    chartTypes: [ChartType]
    filter: JSON
    defaultFilter: ChartFilter
    layout: String
    vizState: String
  }

  enum ChartType {
    pie
    line
    bar
    doughnut
    polarArea
    radar
    bubble
    scatter
  }

  type ChartFilter {
    fieldName: String
    filterValue: String
    filterType: ChartFilterType
  }

  input ChartFilterInput {
    fieldName: String
    filterValue: String
    filterType: ChartFilterType
  }

  enum ChartFilterType {
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
  tagId: String
`;

export const queries = `
  reportsList(${queryParams}): ReportsListResponse
  reportDetail(reportId: String!): Report
  
  reportChartsList: ChartsListResponse
  reportChartDetail(chartId: String!): ReportChart
  reportTemplatesList(searchValue: String, serviceName: String): [ReportTemplate]  
  reportChartTemplatesList(serviceName: String!, charts: [String]): [JSON] 
  reportServicesList: [String]

  reportChartGetTemplates(serviceName: String!): JSON
  reportChartGetFilterTypes(serviceName: String!, templateType: String!): JSON
  reportChartGetResult(serviceName: String!, templateType: String!, filter: JSON): JSON
  reportsCountByTags:JSON
`;

export const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const report_chart_common_params = `
  name: String
  chartType: String
  templateType: String
  order: Int
  vizState: String
  layout: String
  filter: JSON
  serviceName: String
  templateType: String
`;

const report_params = `
  name: String,
  visibility: VisibilityType,
  assignedUserIds: [String],
  assignedDepartmentIds: [String],
  tagIds: [String],
  reportTemplateType: String
  serviceName: String
  charts: [JSON]
`;

export const mutations = `
  reportsAdd(${report_params}): Report
  reportsRemove(_id: String!): JSON
  reportsRemoveMany(ids: [String]!): JSON 
   
  reportsEdit(_id:String!, ${report_params}): Report

  reportChartsAdd(${report_chart_common_params}, reportId: String!): ReportChart
  reportChartsRemove(_id: String!): JSON
  reportChartsEdit(_id: String!, ${report_chart_common_params}): ReportChart
`;
