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

  type WebDeploymentResult {
    status: String!
    deploymentUrl: String
    domains: [String]
    webname: String!
    errorReason: String
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

  type WebChangeField {
    field: String!
    from: JSON
    to: JSON
  }

  type WebActivityLog {
    _id: String!
    webId: String!
    userId: String
    action: String!
    changes: [WebChangeField]
    createdAt: Date
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
    vercelProjectId: String
    lastDeploymentId: String
    lastDeploymentUrl: String
    createdAt: Date
    updatedAt: Date
  }

  type WebCustomDomainRecord {
    type: String!
    name: String!
    value: String!
    status: String!
  }

  type WebCustomDomain {
    name: String!
    verified: Boolean!
    misconfigured: Boolean!
    isActive: Boolean!
    records: [WebCustomDomainRecord!]!
  }

  type WebCustomDomains {
    isDeployed: Boolean!
    defaultDomain: String
    domains: [WebCustomDomain!]!
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
    clientPortalId: String
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

    input WebCreateInput {
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
  getWebDetail(_id: String!): Web
  webCustomDomains(webId: String!): WebCustomDomains

  cpGetWebDetail(_id: String!): Web
  cpGetDomains(_id: String!): JSON
  cpGetDeploymentEvents(_id: String!): WebDeploymentResult
  cpGetWebActivityLogs(webId: String!): [WebActivityLog]
`;

export const mutations = `
  createWeb(doc: WebCreateInput!): Web
  editWeb(_id: String!, doc: WebInput!): Web
  removeWeb(_id: String!): Web
  webCustomDomainAdd(webId: String!, hostname: String!): WebCustomDomains
  webCustomDomainRefresh(webId: String!, hostname: String!): WebCustomDomains
  webCustomDomainRemove(webId: String!, hostname: String!): WebCustomDomains
  
  cpEditWeb(_id: String!, doc: WebInput!): Web
  cpRemoveWeb(_id: String!): Web
  cpDeployWeb(_id: String!): JSON
  cpAddDomain(_id: String!, domain: String!): JSON
  cpRemoveProject(_id: String!): JSON
`;
