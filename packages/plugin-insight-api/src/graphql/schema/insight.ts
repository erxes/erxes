export const types = `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  enum VisibilityType {
    public
    private
  }

  type Dashboard {
    _id: String!
    name: String
    sectionId: String

    visibility: VisibilityType

    serviceTypes: [String]
    serviceNames: [String]
    
    assignedUserIds: [String]
    assignedDepartmentIds: [String]
    
    members: [User]
    charts: [DashboardChart]
    chartsCount: Int

    updatedAt:Date
    updatedBy: User

    createdAt:Date
    createdBy: User
    },
      type DashboardListResponse {
      list: [Dashboard],
      totalCount: Int,
    }


  type DashboardChart {
    _id: String
    name: String
    dashboardId: String!
    contentType: String
    serviceName: String
    templateType: String
    order: Int
    chartType: ChartType
    chartTypes: [ChartType]
    filter: JSON
    dimension: JSON
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
    table
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

  input DashboardChartsAddParams {
    templateType: String
    serviceName: String!
    chartTemplateTypes: [JSON]
  }
  
  type Section {
    _id: String!
    name: String
    type: String
    list: [JSON]
    listCount: Int
    },
      type SectionListResponse {
      list: [Section],
      listCount: Int,
    }
`;

const queryParams = `
  page: Int
  perPage: Int
`;

export const queries = `
  dashboards(${queryParams}): [Dashboard]
  dashboardDetail(_id: String!): Dashboard

  sections(type: String): [Section]

`;

const dashboardParams = `
  name: String,
  sectionId: String,
  visibility: VisibilityType,
  assignedUserIds: [String],
  assignedDepartmentIds: [String],
  serviceTypes: [String]
  serviceNames: [String]
  charts: [JSON]
`;

const dashboardChartParams = `
  name: String
  chartType: String
  templateType: String
  order: Int
  vizState: String
  layout: String
  filter: JSON
  dimension: JSON
  serviceName: String
  templateType: String
`;

const sectionParams = `
  name: String
  type: String
`;

export const mutations = `
  dashboardAdd(${dashboardParams}): Dashboard
  dashboardAddTo(${dashboardParams}): Dashboard
  dashboardEdit(_id: String!, ${dashboardParams}): Dashboard
  dashboardRemove(_id: String!): JSON
  dashboardDuplicate(_id: String!): Dashboard

  dashboardChartsAdd(${dashboardChartParams}, dashboardId: String!): DashboardChart
  dashboardChartsRemove(_id: String!): JSON
  dashboardChartsEdit(_id: String!, ${dashboardChartParams}): DashboardChart
  dashboardChartsAddMany( charts: [DashboardChartsAddParams] ,dashboardId: String!): [DashboardChart] 

  sectionAdd(${sectionParams}): Section
  sectionEdit(_id: String!, ${sectionParams}): Section
  sectionRemove(_id: String!): JSON
`;
