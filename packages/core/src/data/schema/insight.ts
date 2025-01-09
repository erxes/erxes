export const types = `
  enum VisibilityType {
    public
    private
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
    number
    pivotTable
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

  type Insight {
    _id: String!
    name: String
    sectionId: String
    chartsCount: Int
    isPinned: Boolean
    type: String
  }

  type InsightTemplate {
    title: String
    description: String
    charts: [String]
    img: String
    serviceName: String
    serviceType: String
    type: String
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
    charts: [Chart]
    chartsCount: Int

    updatedAt:Date
    updatedBy: User

    createdAt:Date
    createdBy: User

    isPinned: Boolean
    }

    type DashboardListResponse {
      list: [Dashboard],
      totalCount: Int,
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
      charts: [Chart]
      chartsCount: Int
  
      updatedAt:Date
      updatedBy: User
  
      createdAt:Date
      createdBy: User
  
      sectionId: String
      
      serviceName: String
      serviceType: String

      isPinned: Boolean
    }

    type ReportsListResponse {
      list: [Report]
      totalCount: Int
    }

  type Chart {
    _id: String
    name: String
    contentId: String!
    contentType: String
    serviceName: String
    serviceType: String
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

  input ChartsAddParams {
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
searchValue: String
perPage: Int
page: Int
departmentId: String
tag: String
`;

export const queries = `
  insightGetLast: JSON
  insightTemplatesList(searchValue: String, serviceName: String): [InsightTemplate]
  insightChartTemplatesList(serviceName: String!, charts: [String]): [JSON]
  insightServicesList: [String]
  insightChartGetTemplates(serviceName: String!): JSON
  insightChartGetFilterTypes(serviceName: String!, templateType: String!): JSON
  insightPinnedList: [Insight]

  chartGetResult(serviceName: String!, templateType: String!, chartType: String!, filter: JSON, dimension: JSON): JSON

  dashboardList(${queryParams}): DashboardListResponse
  dashboardDetail(_id: String!): Dashboard

  reportList(${queryParams}): ReportsListResponse
  reportDetail(reportId: String!): Report
  reportsCountByTags:JSON
  
  sections(type: String): [Section]

`;

const dashboardParams = `
  name: String,
  sectionId: String,
  visibility: VisibilityType,
  userId: String,
  assignedUserIds: [String],
  assignedDepartmentIds: [String],
  serviceTypes: [String]
  serviceNames: [String]
  charts: [JSON]
`;

const reportParams = `
  name: String,
  visibility: VisibilityType,
  userId: String,
  assignedUserIds: [String],
  assignedDepartmentIds: [String],
  tagIds: [String],
  serviceName: String
  serviceType: String
  sectionId: String
  charts: [JSON]
`;

const chartParams = `
  name: String
  chartType: String
  contentType: String
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

  chartsAdd(${chartParams}, contentId: String!): Chart
  chartsRemove(_id: String!): JSON
  chartsEdit(_id: String!, ${chartParams}): Chart
  chartsAddMany( charts: [ChartsAddParams] ,contentId: String!,contentType: String!, ): [Chart]
  chartsEditMany( contentId: String!, contentType: String!, ${reportParams}): JSON
  chartDuplicate(_id: String!): Chart

  reportAdd(${reportParams}): Report
  reportEdit(_id: String!, ${reportParams}): Report
  reportRemove(_id: String!): JSON
  reportRemoveMany(ids: [String]!): JSON 
   
  reportsEdit(_id:String!, ${reportParams}): Report
  reportDuplicate(_id: String!): Report

  sectionAdd(${sectionParams}): Section
  sectionEdit(_id: String!, ${sectionParams}): Section
  sectionRemove(_id: String!): JSON
`;
