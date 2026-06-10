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
    enabledTypes: [String]
    lastSweepAt: Date
    pointCount: Int
    types: JSON
    lastError: String
  }

  # Where chat attachments land: the instance's existing upload storage,
  # detected from core's file-upload configs. enabled = configured AND the
  # plugin-level toggle is on — when false the chat stays text-only.
  type MastraAttachmentStorageStatus {
    configured: Boolean
    serviceType: String
    enabled: Boolean
  }

  type MastraSettings {
    _id: String
    erxesApiUrl: String
    erxesApiToken: String
    defaultAgentId: String
    attachmentsEnabled: Boolean
    attachmentStorage: MastraAttachmentStorageStatus
    # Brave Search API key — stored encrypted-at-rest by MongoDB, masked in UI.
    # Set BRAVE_SEARCH_API_KEY env var to override. Get a free key at brave.com/search/api/
    searchApiKey: String
    # Read-only: which search provider is active ("brave" | "duckduckgo")
    searchProvider: String

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
    attachmentsEnabled: Boolean
    searchApiKey: String
  }
`;

export const queries = `
  mastraSettings: MastraSettings
  mastraAttachmentStorageStatus: MastraAttachmentStorageStatus
`;

export const mutations = `
  mastraSettingsSave(doc: MastraSettingsInput!): MastraSettings
`;
