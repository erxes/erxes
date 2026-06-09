export const types = `
  type MastraMemoryStatus {
    enabled: Boolean
    embedder: String
    embedderModel: String
    qdrantUrl: String
    qdrantReachable: Boolean
    collection: String
  }

  type MastraSettings {
    _id: String
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String

    # Read-only: the "Advanced memory feature" is controlled by the
    # MASTRA_MEMORY env var, not by app data. Surfaced for display only.
    advancedMemory: Boolean
    advancedMemoryStatus: MastraMemoryStatus
  }

  input MastraSettingsInput {
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String
  }
`;

export const queries = `
  mastraSettings: MastraSettings
`;

export const mutations = `
  mastraSettingsSave(doc: MastraSettingsInput!): MastraSettings
`;
