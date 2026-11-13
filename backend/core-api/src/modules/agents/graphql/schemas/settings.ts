/**
 * GraphQL schema for the tenant-wide agents settings: the admin-controlled
 * feature flags that shape every user's chat surface. Currently that is the
 * code-mode toggle and its sandbox environment.
 */

export const types = `
  type AgentsSettings {
    codeModeEnabled: Boolean
    codeModeEnvironment: String
    approvalMode: String
    updatedAt: Date
  }
`;

export const queries = `
  agentsSettings: AgentsSettings
`;

export const mutations = `
  agentsSettingsUpdate(codeModeEnabled: Boolean, codeModeEnvironment: String, approvalMode: String): AgentsSettings
`;
