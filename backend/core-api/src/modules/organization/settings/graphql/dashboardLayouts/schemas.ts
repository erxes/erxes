export const types = `
  type DashboardLayoutItem {
    id: String!
    type: String!
    x: Int!
    y: Int!
    w: Int!
    h: Int!
    config: JSON
  }

  type DashboardLayout {
    _id: String!
    items: [DashboardLayoutItem!]!
  }

  input DashboardLayoutItemInput {
    id: String!
    type: String!
    x: Int!
    y: Int!
    w: Int!
    h: Int!
    config: JSON
  }
`;

export const queries = `
  dashboardLayoutByCurrentUser: DashboardLayout
`;

export const mutations = `
  dashboardLayoutSave(items: [DashboardLayoutItemInput!]!): DashboardLayout
  dashboardLayoutReset: Boolean
`;
