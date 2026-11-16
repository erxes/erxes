export const types = `
  type TemplateJourney {
    key: String
    name: String
    description: String
    triggerType: String
    stepCount: Int
    preview: JSON
  }

  type Template {
    id: String
    pluginName: String
    version: Int
    name: String
    description: String
    icon: String
    group: String
    requirements: JSON
    parts: JSON
    journeys: [TemplateJourney]
  }

  type TemplateInstalledAutomation {
    _id: String
    journey: String
    name: String
    status: String
  }

  type TemplateInstallation {
    _id: String
    templateId: String
    pluginName: String
    version: Int
    name: String
    answers: JSON
    partIds: JSON
    automationIds: JSON
    automations: [TemplateInstalledAutomation]
    createdBy: String
    createdAt: Date
  }
`;

export const queries = `
  templates: [Template]
  templateDetail(pluginName: String!, id: String!): Template
  templateInstallations: [TemplateInstallation]
  templateInstallationDetail(_id: String!): TemplateInstallation
`;

export const mutations = `
  templateInstall(pluginName: String!, id: String!, answers: JSON!): TemplateInstallation
  templateInstallationRemove(_id: String!): JSON
`;
