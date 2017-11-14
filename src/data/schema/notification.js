export const types = `
  type Notification {
    _id: String!
    notifType: String
    title: String
    link: String
    content: String
    createdUser: String
    receiver: String
    date: Date
    isRead: Boolean
  }

  type NotificationConfiguration {
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
  title: String
`;

export const queries = `
  notifications(${params}): [Notification]
  notificationsCount(requireRead: Boolean): Int
  notificationsModules : [JSON]
  notificationsGetConfigurations : [NotificationConfiguration]
`;

export const mutations = `
  notificationsSaveConfig (notifType: String!, isAllowed: Boolean): NotificationConfiguration
  notificationsMarkAsRead (_ids: [String]!) : Boolean
`;
