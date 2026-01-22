export const types = `
  type CPNotificationConfig {
    _id: String!
    clientPortalId: String!
    eventType: String!
    inAppEnabled: Boolean!
    firebaseEnabled: Boolean!
    template: CPNotificationTemplate
    createdAt: Date!
    updatedAt: Date!
  }

  type CPNotificationTemplate {
    title: String
    message: String
  }

  type CPNotificationConfigListResponse {
    list: [CPNotificationConfig]
    totalCount: Int
  }

  input CPNotificationTemplateInput {
    title: String
    message: String
  }

  input CPNotificationConfigInput {
    clientPortalId: String!
    eventType: String!
    inAppEnabled: Boolean!
    firebaseEnabled: Boolean!
    template: CPNotificationTemplateInput
  }
`;

export const queries = `
    clientPortalNotificationConfigs(clientPortalId: String!): CPNotificationConfigListResponse
    clientPortalNotificationConfig(_id: String!): CPNotificationConfig
`;

export const mutations = `
    clientPortalNotificationConfigAdd(config: CPNotificationConfigInput!): CPNotificationConfig
    clientPortalNotificationConfigUpdate(_id: String!, config: CPNotificationConfigInput!): CPNotificationConfig
    clientPortalNotificationConfigDelete(_id: String!): JSON
`;

export default { queries, mutations, types };
