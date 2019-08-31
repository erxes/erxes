export const types = `
  type Integration {
    _id: String!
    kind: String!
    name: String!
    brandId: String!
    languageCode: String
    code: String
    formId: String
    tagIds: [String]
    tags: [Tag]
    formData: JSON
    messengerData: JSON
    uiOptions: JSON

    brand: Brand
    form: Form
    channels: [Channel]
  }

  type integrationsTotalCount {
    total: Int
    byTag: JSON
    byChannel: JSON
    byBrand: JSON
    byKind: JSON
  }

  input IntegrationFormData {
    loadType: String
    successAction: String
    fromEmail: String,
    userEmailTitle: String
    userEmailContent: String
    adminEmails: [String]
    adminEmailTitle: String
    adminEmailContent: String
    thankContent: String
    redirectUrl: String
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
    youtube: String
  }

  input IntegrationMessengerData {
    _id: String
    notifyCustomer: Boolean
    availabilityMethod: String
    isOnline: Boolean,
    onlineHours: [MessengerOnlineHoursSchema]
    timezone: String
    messages: JSON
    knowledgeBaseTopicId: String
    links: IntegrationLinks
    supporterIds: [String]
    requireAuth: Boolean
    showChat: Boolean
    showLauncher: Boolean
    forceLogoutWhenResolve: Boolean
  }

  input MessengerUiOptions {
    color: String
    wallpaper: String
    logo: String
  }

  input gmailAttachmentData {
    filename: String
    size: Int
    mimeType: String
    data: String
  }
`;

export const queries = `
  integrations(
    page: Int,
    perPage: Int,
    kind: String,
    searchValue: String,
    channelId: String,
    brandId: String,
    tag: String
  ): [Integration]

  integrationDetail(_id: String!): Integration
  integrationsTotalCount: integrationsTotalCount
  integrationsFetchApi(path: String!, params: JSON!): JSON
`;

export const mutations = `
  integrationsCreateMessengerIntegration(
    name: String!,
    brandId: String!,
    languageCode: String
    ): Integration

  integrationsEditMessengerIntegration(
    _id: String!,
    name: String!,
    brandId: String!,
    languageCode: String
  ): Integration

  integrationsSaveMessengerAppearanceData(
    _id: String!,
    uiOptions: MessengerUiOptions): Integration

  integrationsSaveMessengerConfigs(
    _id: String!,
    messengerData: IntegrationMessengerData): Integration

  integrationsCreateFormIntegration(
    name: String!,
    brandId: String!,
    languageCode: String,
    formId: String!,
    formData: IntegrationFormData!): Integration

  integrationsEditFormIntegration(
    _id: String!
    name: String!,
    brandId: String!,
    languageCode: String,
    formId: String!,
    formData: IntegrationFormData!): Integration

  integrationsCreateExternalIntegration(
    kind: String!,
    name: String!,
    brandId: String!,
    accountId: String,
    data: JSON): Integration

  integrationsRemove(_id: String!): JSON
  integrationsRemoveAccount(_id: String!): JSON

  integrationSendMail(
    erxesApiId: String!
    subject: String!
    textHtml: String!
    textPlain: String!
    to: String!
    cc: String
    bcc: String
    from: String!
    headerId: String
    threadId: String
    references: String
    attachments: [gmailAttachmentData]
  ): JSON
`;
