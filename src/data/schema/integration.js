export const types = `
  type Integration {
    _id: String!
    kind: String!
    name: String!
    brandId: String!
    code: String
    formId: String
    formData: JSON
    messengerData: JSON
    twitterData: JSON
    facebookData: JSON
    uiOptions: JSON

    brand: Brand
    form: Form
    channels: [Channel]
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

  input IntegrationMessengerData {
    _id: String
    notifyCustomer: Boolean
    availabilityMethod: String
    isOnline: Boolean,
    onlineHours: [MessengerOnlineHoursSchema]
    timezone: String
    welcomeMessage: String
    awayMessage: String
    thankYouMessage: String
  }

  input MessengerUiOptions {
    color: String
    wallpaper: String
    logo: String
  }
`;

export const queries = `
  integrations(limit: Int, kind: String): [Integration]
  integrationDetail(_id: String!): Integration
  integrationsTotalCount(kind: String): Int
`;

export const mutations = `
  integrationsCreateMessengerIntegration(
    name: String!,
    brandId: String!): Integration

  integrationsEditMessengerIntegration(
    _id: String!,
    name: String!,
    brandId: String!): Integration

  integrationsSaveMessengerAppearanceData(
    _id: String!,
    uiOptions: MessengerUiOptions): Integration

  integrationsSaveMessengerConfigs(
    _id: String!,
    messengerData: IntegrationMessengerData): Integration

  integrationsCreateFormIntegration(
    name: String!,
    brandId: String!,
    formId: String!,
    formData: IntegrationFormData!): Integration

  integrationsEditFormIntegration(
    _id: String!
    name: String!,
    brandId: String!,
    formId: String!,
    formData: IntegrationFormData!): Integration

  integrationsRemove(_id: String!): String
`;
