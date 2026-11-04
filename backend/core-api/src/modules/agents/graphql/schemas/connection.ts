/**
 * GraphQL schema for the acting user's bring-your-own-key agents
 * connections. Multiple providers may be configured at once; the API key
 * itself never appears in the schema: reads expose only a `hasKey` flag,
 * and writes accept the key as input only. `isDefault` marks the one entry
 * an unselected chat turn runs on (explicit default, else the first saved).
 */

export const types = `
  type AgentsConnectionEntry {
    provider: String
    model: String
    hasKey: Boolean
    isDefault: Boolean
    updatedAt: Date
  }

  type AgentsModelThinking {
    kind: String
    levels: [String]
  }

  type AgentsModelInfo {
    id: String
    family: String
    recommended: Boolean
    name: String
    thinking: AgentsModelThinking
  }

  type AgentsModelVerification {
    provider: String
    model: String
    ok: Boolean
    error: String
  }

  type AgentsBuiltin {
    provider: String
    model: String
    name: String
    usedTokens: Float
    limitTokens: Float
    resetsAt: Date
    exhausted: Boolean
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
  agentsBuiltin: AgentsBuiltin
`;

export const mutations = `
  agentsConnectionUpsert(provider: String!, model: String, apiKey: String): AgentsConnectionEntry
  agentsConnectionRemove(provider: String!): Boolean
  agentsConnectionSetDefault(provider: String): [AgentsConnectionEntry]
  agentsModelVerify(provider: String!, model: String!): AgentsModelVerification
`;
