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

export const mutations = `
  notificationsSaveConfig (
    notifType: String,
    isAllowed: Boolean,
    user: String,
  ): NotificationConfiguration

  notificationsMarkAsRead ( ids: [String]! ) : Boolean
`;

export const queries = `
  notificationsModules(ids: [String]) : [String]
`;
