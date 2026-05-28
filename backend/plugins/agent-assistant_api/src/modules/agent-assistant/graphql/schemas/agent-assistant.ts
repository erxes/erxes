export const types = `
  enum AgentAssistantStatus {
    active
    inactive
  }

  type AgentAssistant {
    _id: String!
    name: String!
    description: String
    modelProvider: String!
    apiKey: String!
    status: AgentAssistantStatus!
    createdAt: Date
    updatedAt: Date
  }
`;

export const inputs = `
  input AgentAssistantInput {
    name: String!
    description: String
    modelProvider: String!
    apiKey: String!
    status: AgentAssistantStatus
  }
`;

export const queries = `
  agentAssistants(page: Int, perPage: Int): [AgentAssistant]
  agentAssistantDetail(_id: String!): AgentAssistant
`;

export const mutations = `
  agentAssistantsAdd(doc: AgentAssistantInput!): AgentAssistant
  agentAssistantsEdit(_id: String!, doc: AgentAssistantInput!): AgentAssistant
  agentAssistantsRemove(_id: String!): JSON
`;
