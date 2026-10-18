/** GraphQL operation catalog, filtered by the system-operation policy. */

export const types = `
  type AgentsToolField {
    name: String
    type: String
    required: Boolean
  }

  type AgentsTool {
    id: String!
    plugin: String!
    module: String
    path: String
    method: String
    description: String
    requiresApproval: Boolean!
    inputFields: [AgentsToolField]
  }

  type AgentsToolCatalog {
    tools: [AgentsTool!]!
    unavailablePlugins: [String!]!
  }
`;

export const queries = `
  agentsTools: AgentsToolCatalog
`;

export const mutations = `
`;
