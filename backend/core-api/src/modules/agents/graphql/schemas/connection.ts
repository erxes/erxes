/**
 * GraphQL schema for the acting user's bring-your-own-key agents
 * connections. Multiple providers may be configured at once; the API key
 * itself never appears in the schema: reads expose only a `hasKey` flag,
 * and writes accept the key as input only.
 */

export const types = `
  type AgentsConnectionEntry {
    provider: String
    model: String
    hasKey: Boolean
    updatedAt: Date
  }

  type AgentsModelInfo {
    id: String
    family: String
    recommended: Boolean
  }

  type AgentsProviderModels {
    provider: String
    models: [String]
    catalog: [AgentsModelInfo]
    error: String
  }
`;

export const queries = `
  agentsConnections: [AgentsConnectionEntry]
  agentsModels: [AgentsProviderModels]
`;

export const mutations = `
  agentsConnectionUpsert(provider: String!, model: String, apiKey: String): AgentsConnectionEntry
  agentsConnectionRemove(provider: String!): Boolean
`;
