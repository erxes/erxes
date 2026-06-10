export const types = `
  type MastraMemoryStatus {
    enabled: Boolean
    embedder: String
    embedderModel: String
    qdrantUrl: String
    qdrantReachable: Boolean
    collection: String
  }

  type MastraKnowledgeStatus {
    enabled: Boolean
    embedder: String
    embedderModel: String
    qdrantUrl: String
    qdrantReachable: Boolean
    collection: String
    lastSweepAt: Date
    articleCount: Int
    pointCount: Int
    lastError: String
  }

  type MastraSettings {
    _id: String
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String

    # Read-only: the "Advanced memory feature" is controlled by the
    # ERXES_AGENT_MEMORY env var, not by app data. Surfaced for display only.
    advancedMemory: Boolean
    advancedMemoryStatus: MastraMemoryStatus

    # Read-only: company knowledge RAG, controlled by ERXES_AGENT_KNOWLEDGE.
    knowledgeStatus: MastraKnowledgeStatus
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
