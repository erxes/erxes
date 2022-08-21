export const types = `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }


  type Dashboard {
    _id: String!
    name: String
    visibility: String
    selectedMemberIds: [String]
    description: String
    parentId: String
    childsDashboard: [Dashboard]
    order: String
    dashboardCount: Int
    relatedIds: [String]
    createdAt: Date
    updatedAt: Date
    createdBy: String
    updatedBy: String

    createdUser: User
    updatedUser: User
    members: [User]
    itemsCount: Int
  } 

  type DashboardItem {
    _id: String!
    dashboardId: String
    layout: String
    vizState: String
    name: String
    type: String
    isDateRange: Boolean
  }

  type DashboardListResponse {
    list: [Dashboard],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  dashboards(${queryParams}): [Dashboard]
  dashboardsMain(${queryParams}): DashboardListResponse
  dashboardDetails(_id: String!): Dashboard
  dashboardsTotalCount: Int
  dashboardItems(dashboardId: String!): [DashboardItem]
  dashboardItemDetail(_id: String!): DashboardItem
  dashboardGetTypes: [String]
`;

export const mutations = `
  dashboardsAdd(name: String, description: String, visibility: String, selectedMemberIds: [String], parentId: String): Dashboard
  dashboardsEdit(_id: String!, name: String, description: String, visibility: String, selectedMemberIds: [String], parentId: String): Dashboard
  dashboardsRemove(dashboardIds: [String]): JSON
  dashboardItemsAdd(dashboardId: String, layout: String, vizState: String, name: String, type: String, isDateRange: Boolean): DashboardItem
  dashboardItemsEdit(_id: String!, dashboardId:String, layout: String, vizState: String, name: String, type: String): DashboardItem
  dashboardItemsRemove(_id: String!): String
  renderDashboard: String
`;
