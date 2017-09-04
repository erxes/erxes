export const types = `
  scalar JSON
  scalar Date

  type User {
    _id: String!
    username: String
    details: JSON
    emails: JSON
  }

  type Channel {
    _id: String!
    name: String
    description: String
    integrationIds: [String]
    memberIds: [String]
    createdAt: Date
    userId: String
    conversationCount: Int
    openConversationCount: Int
  }

  type Brand {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    emailConfig: JSON
  }

  type Integration {
    _id: String!
    kind: String
    name: String
    code: String
    formId: String
    formData: JSON
    messengerData: JSON
    twitterData: JSON
    facebookData: JSON
    uiOptions: JSON

    brand: Brand
    channels: [Channel]
  }

  type ResponseTemplate {
    _id: String!
    name: String
    content: String
    brandId: String
    brand: Brand,
    files: JSON
  }

  type EmailTemplate {
    _id: String!
    name: String
    content: String
  }

  type Form {
    _id: String!
    title: String
    code: String
    description: String
    createdUserId: String
    createdDate: Date
  }

  type FormField {
    _id: String!
    formId: String
    type: String
    validation: String
    text: String
    description: String
    options: [String]
    isRequired: Boolean
    order: Int
  }
`;

export const queries = `
  type Query {
    users(limit: Int): [User]
    totalUsersCount: Int

    channels(limit: Int): [Channel]
    totalChannelsCount: Int

    brands(limit: Int): [Brand]
    brandDetail(_id: String!): Brand
    totalBrandsCount: Int

    integrations(limit: Int, kind: String): [Integration]
    totalIntegrationsCount(kind: String): Int

    responseTemplates(limit: Int): [ResponseTemplate]
    totalResponseTemplatesCount: Int

    emailTemplates(limit: Int): [EmailTemplate]
    totalEmailTemplatesCount: Int

    forms(limit: Int): [Form]
    formFields(formId: String!): [FormField]
    totalFormsCount: Int
  }
`;

export const mutations = `
`;

export const subscriptions = `
`;
