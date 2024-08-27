const configFields = {
  main: `
    _id: String,
    userId: String,
    isDefault: Boolean,
    isDisabled: Boolean,
    isAllowEmail: Boolean,
    isAllowedDesktop: Boolean,
  `,
  plugin: `
    type: String,
    isDisabled: Boolean,
  `,
  pluginNotifType: `
    notifType: String,
    isDisabled: Boolean,
    isDisabledEmail: Boolean,
    isDisabledDesktop: Boolean,
    customHtml: String,`
};

export const types = `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type Notification {
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

  type PluginNotifType  {
    ${configFields.pluginNotifType}
  }

  type PluginConfig {
    ${configFields.plugin}
    notifTypes: [PluginNotifType]
  }

  type NotificationConfiguration {
    ${configFields.main}
    pluginsConfigs:[PluginConfig]
  }

  input IPluginNotifType {
    ${configFields.pluginNotifType}
  }

  input IPluginConfig {
    ${configFields.plugin},
    notifTypes: [IPluginNotifType]
  }

  input INotificationConfiguration {
    ${configFields.main}
     pluginsConfigs:[IPluginConfig]
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
  notifications(${params}): [Notification]
  notificationCounts(requireRead: Boolean, notifType: String, contentTypes: [String]): Int
  notificationsModules : [JSON]
  notificationsGetConfigurations(isDefault:Boolean) : NotificationConfiguration
  `;

export const mutations = `
  notificationsSaveConfig (${configFields.main},pluginsConfigs:[IPluginConfig]): NotificationConfiguration
  notificationsSetAsDefaultConfig: JSON
  notificationsMarkAsRead (_ids: [String], contentTypeId: String) : JSON
  notificationsShow : String
`;
