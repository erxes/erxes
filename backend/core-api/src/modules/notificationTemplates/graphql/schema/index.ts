export const types = `
  type NotificationTemplateVariable {
    name: String!
    label: String!
    sample: String
    required: Boolean
  }

  type NotificationTemplateVersion {
    subject: String
    preheader: String
    content: String
    contentJson: JSON
    savedAt: Date
    savedUser: User
  }

  type NotificationTemplate {
    key: String!
    title: String!
    description: String
    defaultSubject: String
    variables: [NotificationTemplateVariable]
    starterJson: JSON
    draft: NotificationTemplateVersion
    published: NotificationTemplateVersion
    draftRevision: Int
    publishedRevision: Int
    version: Int
    fallbackCount: Int
    lastFallbackAt: Date
    lastFallbackReason: String
  }

  type NotificationTemplatePreview {
    subject: String
    html: String
    unresolved: [String]
  }

  type NotificationEmailBrand {
    name: String
    logoUrl: String
    color: String
    footerText: String
  }

  input NotificationTemplateInput {
    subject: String
    preheader: String
    content: String!
    contentJson: JSON!
  }

  input NotificationEmailBrandInput {
    name: String
    logoUrl: String
    color: String
    footerText: String
  }
`;

export const queries = `
  notificationTemplates: [NotificationTemplate]
  notificationTemplateDetail(key: String!): NotificationTemplate
  notificationTemplatePreview(key: String!, input: NotificationTemplateInput!): NotificationTemplatePreview
  notificationEmailBrand: NotificationEmailBrand
`;

export const mutations = `
  notificationTemplateSaveDraft(key: String!, draftRevision: Int!, input: NotificationTemplateInput!): NotificationTemplate
  notificationTemplatePublish(key: String!, draftRevision: Int!, input: NotificationTemplateInput!): NotificationTemplate
  notificationTemplateRevert(key: String!): NotificationTemplate
  notificationTemplateSendTest(key: String!, input: NotificationTemplateInput!): String
  notificationEmailBrandUpdate(input: NotificationEmailBrandInput!): NotificationEmailBrand
`;
