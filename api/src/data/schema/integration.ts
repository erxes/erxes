export const types = `
  type Integration @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    kind: String!
    name: String!
    brandId: String!
    languageCode: String
    code: String
    formId: String
    tagIds: [String]
    tags: [Tag]
    leadData: JSON
    messengerData: JSON
    uiOptions: JSON
    isActive: Boolean
    webhookData: JSON

    brand: Brand
    form: Form
    channels: [Channel]

    websiteMessengerApps: [MessengerApp]
    knowledgeBaseMessengerApps: [MessengerApp]
    leadMessengerApps: [MessengerApp]
    healthStatus: JSON

    bookingData: BookingData
  }

  type BookingData {
    name: String
    image: Attachment
 
    description: String
    userFilters: [String]
    productCategoryId: String

    style: JSON
    displayBlock: JSON
    viewCount: Int

    categoryTree: JSON
    mainProductCategory: ProductCategory
    navigationText: String
    bookingFormText: String
    productFieldIds: [String]
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

  input IntegrationLeadData {
    loadType: String
    successAction: String
    fromEmail: String,
    userEmailTitle: String
    userEmailContent: String
    adminEmails: [String]
    adminEmailTitle: String
    adminEmailContent: String
    thankTitle: String
    thankContent: String
    redirectUrl: String
    themeColor: String
    callout: JSON,
    rules: [InputRule]
    isRequireOnce: Boolean
    templateId: String
    attachments: [AttachmentInput]
    css: String
    successImage: String
    successImageSize: String
  }

  input BookingStyleInput {
    itemShape: String
    widgetColor: String

    productAvailable: String
    baseFont: String

    line: String
    rows: Int
    columns: Int
    margin: Int
  }

  input IntegrationBookingData {
    name: String
    description: String
    image: AttachmentInput
    style: BookingStyleInput
   
    productCategoryId: String

    navigationText: String
    bookingFormText: String
    productFieldIds: [String]
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
    botEndpointUrl: String
    skillData: JSON
    botShowInitialMessage: Boolean
    availabilityMethod: String
    isOnline: Boolean,
    onlineHours: [MessengerOnlineHoursSchema]
    timezone: String
    responseRate: String
    showTimezone: Boolean
    messages: JSON
    knowledgeBaseTopicId: String
    links: IntegrationLinks
    supporterIds: [String]
    requireAuth: Boolean
    showChat: Boolean
    showLauncher: Boolean
    forceLogoutWhenResolve: Boolean
    showVideoCallRequest: Boolean
  }

  input MessengerUiOptions {
    color: String
    wallpaper: String
    logo: String
    textColor: String
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
    tag: String,
    status: String,
    formLoadType: String,
    sortField: String
    sortDirection: Int
  ): [Integration]

  allLeadIntegrations: [Integration]

  integrationsGetUsedTypes: [integrationsGetUsedTypes]
  integrationGetLineWebhookUrl(_id: String!): String
  integrationDetail(_id: String!): Integration
  integrationsTotalCount(kind: String, brandId: String, tag: String, channelId: String, status: String, formLoadType: String): integrationsTotalCount
  integrationsFetchApi(path: String!, params: JSON!): JSON
`;

export const mutations = `
  integrationsCreateMessengerIntegration(
    name: String!,
    brandId: String!,
    languageCode: String
    channelIds: [String]
    ): Integration

  integrationsEditMessengerIntegration(
    _id: String!,
    name: String!,
    brandId: String!,
    languageCode: String
    channelIds: [String]
  ): Integration

  integrationsSaveMessengerAppearanceData(
    _id: String!,
    uiOptions: MessengerUiOptions): Integration

  integrationsSaveMessengerConfigs(
    _id: String!,
    messengerData: IntegrationMessengerData): Integration

  integrationsCreateLeadIntegration(
    name: String!,
    brandId: String!,
    channelIds: [String]
    languageCode: String,
    formId: String!,
    leadData: IntegrationLeadData!): Integration

  integrationsEditLeadIntegration(
    _id: String!
    name: String!,
    brandId: String!,
    channelIds: [String]
    languageCode: String,
    formId: String!,
    leadData: IntegrationLeadData!): Integration

  integrationsCreateExternalIntegration(
    kind: String!,
    name: String!,
    brandId: String!,
    accountId: String,
    channelIds: [String]
    data: JSON): Integration

  integrationsEditCommonFields(_id: String!, name: String!, brandId: String!, channelIds: [String], data: JSON): Integration

  integrationsRemove(_id: String!): JSON
  integrationsRemoveAccount(_id: String!): JSON

  integrationsArchive(_id: String!, status: Boolean!): Integration
  integrationsRepair(_id: String!): JSON

  integrationSendMail(
    erxesApiId: String!
    subject: String!
    body: String
    to: [String]!
    cc: [String]
    bcc: [String]
    from: String!
    shouldResolve: Boolean
    headerId: String
    replyTo: [String]
    inReplyTo: String
    threadId: String
    messageId: String
    replyToMessageId: String
    kind: String
    references: [String]
    attachments: [JSON]
    customerId: String
  ): JSON

  integrationsUpdateConfigs(configsMap: JSON!): JSON

  integrationsSendSms(integrationId: String!, content: String!, to: String!): JSON

  integrationsCopyLeadIntegration(_id: String!): Integration

  integrationsCreateBookingIntegration(
    name: String!
    brandId: String!
    channelIds: [String]
    languageCode: String
    formId: String
    leadData: IntegrationLeadData
    bookingData: IntegrationBookingData
  ): Integration

  integrationsEditBookingIntegration(
    _id: String!
    name: String!
    brandId: String!
    channelIds: [String]
    languageCode: String
    formId: String
    leadData: IntegrationLeadData
    bookingData: IntegrationBookingData
  ): Integration
`;
