export const types = `
  type Dashboard {
    _id: String!
    name: String
  }

  type DashboardItem {
    _id: String!
    dashboardId: String
    layout: String
    vizState: String
    name: String
    type: String
  }
`;

export const queries = `
  dashboards(page: Int, perPage: Int): [Dashboard]
  dashboardDetails(_id: String!): Dashboard
  dashboardsTotalCount: Int
  dashboardItems(dashboardId: String!): [DashboardItem]
  dashboardItemDetail(_id: String!): DashboardItem
  dashboardInitialDatas(type: String): [DashboardItem]
`;

export const mutations = `
  dashboardAdd(name: String): Dashboard
  dashboardEdit(_id: String!, name: String!): Dashboard
  dashboardRemove(_id: String!): JSON
  dashboardItemAdd(dashboardId: String, layout: String, vizState: String, name: String, type: String): DashboardItem
  dashboardItemEdit(_id: String!, dashboardId:String, layout: String, vizState: String, name: String, type: String): DashboardItem
  dashboardItemRemove(_id: String!): String
  dashboardSendEmail(dashboardId: String!, toEmails: [String]!, subject: String, content: String, sendUrl: Boolean, attachmentType: String): String
  renderDashboard: String
`;
