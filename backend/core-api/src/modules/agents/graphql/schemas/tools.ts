/**
 * GraphQL schema for the agents tool catalog — the read-side surface of the
 * admit-only agent tool bridge (`/agent-tools/manifest` on every plugin).
 * The catalog powers the capabilities page; it never exposes input schemas
 * or failure details, only shapes a logged-in agent user may know.
 */

export const types = `
  type AgentsToolPermission {
    module: String
    action: String
  }

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
    allowed: Boolean!
    permission: AgentsToolPermission
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
