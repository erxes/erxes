import { cursorParams } from '@/inbox/graphql/schemas/conversation';
export const types = `
  input InputRule {
    _id : String!,
    kind: String!,
    text: String!,
    condition: String!,
    value: String,
  }

  type CloudflareCallDataDepartment {
    _id: String
    name: String
    operators: JSON
  }
  type CloudflareCallsData {
    header: String
    description: String
    secondPageHeader: String
    secondPageDescription: String
    departments: [CloudflareCallDataDepartment]
    isReceiveWebCall: Boolean
  }
    type Form {
      _id: String
      title: String
      code: String
    }
  type Integration @key(fields: "_id") {
   _id: String!
    kind: String!
    name: String!
    languageCode: String
    code: String
    formId: String
    tagIds: [String]
    createdAt: Date
    tags: [Tag]

    leadData: JSON
    messengerData: JSON
    ticketData: JSON
    uiOptions: JSON
    isActive: Boolean
    isConnected: Boolean
    webhookData: JSON
    channelId: String

    channel: Channel


    healthStatus: JSON
    form : Form

    visibility: String
    departmentIds: [String]

    details: JSON
    callData: CloudflareCallsData
    facebookPage: JSON
  }
  type IntegrationRespone {
    list: [Integration],
    pageInfo: PageInfo
    totalCount: Int,
  }

  type integrationsTotalCount {
    total: Int
    byTag: JSON
    byChannel: JSON
    byBrand: JSON
    byKind: JSON
    byStatus: JSON
  }

  type integrationsGetUsedTypes {
    _id: String
    name: String
  }

  input BotPersistentMenuTypeMessenger {
    _id: String
    type: String
    text: String
    link: String
    isEditing: Boolean
  }
  input MessengerOnlineHoursSchema {
    _id: String
    day: String
    from: String
    to: String
  }

  input IntegrationLinks {
    twitter: String
    facebook: String
    instagram:String
    youtube: String
  }

  input IntegrationExternalLinks {
    url: String
  }

  input IntegrationMessengerData {
    _id: String
    notifyCustomer: Boolean
    botEndpointUrl: String
    skillData: JSON
    botShowInitialMessage: Boolean
    botCheck: Boolean
    botGreetMessage: String
    getStarted: Boolean
    persistentMenus: [BotPersistentMenuTypeMessenger]
    availabilityMethod: String
    isOnline: Boolean,
    onlineHours: [MessengerOnlineHoursSchema]
    timezone: String
    responseRate: String
    showTimezone: Boolean
    messages: JSON
    knowledgeBaseTopicId: String
    links: IntegrationLinks
    externalLinks: [IntegrationExternalLinks]
    supporterIds: [String]
    requireAuth: Boolean
    showChat: Boolean
    showLauncher: Boolean
    forceLogoutWhenResolve: Boolean
    showVideoCallRequest: Boolean
    hideWhenOffline: Boolean
  }

  input MessengerUiOptions {
    color: String
    wallpaper: String
    logo: String
    textColor: String
  }

  input OperatorInput {
    _id: String
    userId: String
    name: String
  }

  input DepartmentInput {
    _id: String
    name: String
    operators: [OperatorInput]
  }

  input IntegrationCallData {
    header: String
    description: String
    secondPageHeader: String
    secondPageDescription: String
    departments: [DepartmentInput]
    isReceiveWebCall: Boolean
  }
`;

export const queries = `
  integrations(
    ${cursorParams},
    page: Int,
    perPage: Int,
    kind: String,
    searchValue: String,
    channelId: String!,
    tag: String,
    status: String,
    formLoadType: String,
    sortField: String
    sortDirection: Int
  ): IntegrationRespone

  allLeadIntegrations: [Integration]
  integrationsGetUsedTypes: [integrationsGetUsedTypes]
  integrationGetLineWebhookUrl(_id: String!): String
  integrationDetail(_id: String!): Integration
  integrationsTotalCount(kind: String, tag: String, channelId: String!, status: String, formLoadType: String): integrationsTotalCount
`;

export const mutations = `
  integrationsCreateMessengerOnboarding(
    channelId: String!,
    brandName: String!,
    languageCode: String
    color: String
    logo:String
  ): Integration


  integrationsEditMessengerOnboarding(
    _id: String!,
    channelId: String!,
    brandName: String!,
    languageCode: String
    color: String
    logo:String
  ): Integration

  integrationsCreateMessengerIntegration(
    channelId: String!,
    name: String!,
    languageCode: String
    ): Integration

  integrationsEditMessengerIntegration(
    _id: String!,
    channelId: String!,
    name: String!,
    languageCode: String
  ): Integration

  integrationsSaveMessengerAppearanceData(
    _id: String!,
    channelId: String!,
    uiOptions: MessengerUiOptions): Integration

  integrationsSaveMessengerConfigs(
    _id: String!,
    channelId: String!,
    messengerData: IntegrationMessengerData,
    callData: IntegrationCallData
    ): Integration

  integrationsCreateExternalIntegration(
    kind: String!,
    channelId: String!,
    name: String!,
    accountId: String,
    data: JSON): Integration

  integrationsEditCommonFields(_id: String!, name: String!, channelId: String, details: JSON): Integration

  integrationsRemove(_id: String!): JSON
  integrationsRemoveAccount(_id: String!, kind: String): JSON
  integrationsRepair(_id: String!, kind: String!): JSON

  integrationsArchive(_id: String!, status: Boolean!): Integration

  integrationsSendSms(integrationId: String!, content: String!, to: String!): JSON

  integrationsCreateLeadIntegration(
    name: String!,
    channelId: String
    ): Integration

  integrationsEditLeadIntegration(
    _id: String!
    name: String!,
    channelId: String
  ): Integration
  integrationsCopyLeadIntegration(_id: String!): Integration
`;
