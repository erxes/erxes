export const types = `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type Goal {
    _id: String!
    notifType: String
    title: String
    link: String
    content: String
    action: String
    createdUser: User
    receiver: String
    date: Date
    isRead: Boolean
  }

  type GoalConfiguration {
    _id: String!
    user: String
    notifType: String
    isAllowed: Boolean
  }
`;

const params = `
  limit: Int,
  page: Int,
  perPage: Int,
  requireRead: Boolean,
  notifType: String
  contentTypes: [String]
  title: String
  startDate: String
  endDate: String
`;

export const queries = `
  goals(${params}): [Goal]
  goalCounts(requireRead: Boolean, notifType: String, contentTypes: [String]): Int
  goalsModules : [JSON]
  goalsGetConfigurations : [GoalConfiguration]
`;

export const mutations = `
  goalsSaveConfig (notifType: String!, isAllowed: Boolean): GoalConfiguration
  goalsMarkAsRead (_ids: [String], contentTypeId: String) : JSON
  goalsShow : String
`;
