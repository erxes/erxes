export const types = `
  type Appearances {
    backgroundColor: String
    primaryColor: String
    secondaryColor: String
    accentColor: String
    fontSans: String
    fontHeading: String
    fontMono: String
  }

  type Integrations {
    googleAnalytics: String
    facebookPixel: String
    googleTagManager: String
    messengerBrandCode: String
  }

  type EnvironmentVariable {
    key: String
    value: String
  }

  type Web {
    _id: String!
    clientPortalId: String!
    name: String!
    description: String
    keywords: [String]
    domain: String
    copyright: String
    logo: Attachment
    favicon: Attachment
    thumbnail: Attachment
    appearances: Appearances
    templateId: String
    templateType: String
    erxesAppToken: String
    externalLinks: JSON
    integrations: Integrations
    environmentVariables: [EnvironmentVariable]
    projectId: String
    lastDeploymentId: String
    lastDeploymentUrl: String
    createdAt: Date
    updatedAt: Date
  }
`;

export const inputs = `
  input AppearancesInput {
    backgroundColor: String
    primaryColor: String
    secondaryColor: String
    accentColor: String
    fontSans: String
    fontHeading: String
    fontMono: String
  }

  input IntegrationsInput {
    googleAnalytics: String
    facebookPixel: String
    googleTagManager: String
    messengerBrandCode: String
  }

  input EnvironmentVariableInput {
    key: String
    value: String
  }

  input WebInput {
    clientPortalId: String!
    name: String!
    description: String
    keywords: [String]
    domain: String
    copyright: String
    logo: AttachmentInput
    favicon: AttachmentInput
    thumbnail: AttachmentInput
    appearances: AppearancesInput
    templateId: String
    templateType: String
    erxesAppToken: String
    externalLinks: JSON
    integrations: IntegrationsInput
    environmentVariables: [EnvironmentVariableInput]
  }
`;

export const queries = `
  getWebList: [Web]
  getWebDetail(clientPortalId: String!): Web
  cpGetWebDetail(clientPortalId: String!): Web

  cpGetDomains(clientPortalId: String!): JSON
  cpGetDeploymentEvents(clientPortalId: String!): JSON
`;

export const mutations = `
  createWeb(doc: WebInput!): Web
  editWeb(clientPortalId: String!, doc: WebInput!): Web
  removeWeb(clientPortalId: String!): Web

  cpDeployWeb(clientPortalId: String!): JSON
  cpAddDomain(clientPortalId: String!, domain: String!): JSON
  cpRemoveProject(clientPortalId: String!): JSON
`;
