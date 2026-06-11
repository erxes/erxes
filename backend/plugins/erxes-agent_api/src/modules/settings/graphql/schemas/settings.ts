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
  }
`;

export const queries = `
  mastraSettings: MastraSettings
  mastraAttachmentStorageStatus: MastraAttachmentStorageStatus
`;

export const mutations = `
  mastraSettingsSave(doc: MastraSettingsInput!): MastraSettings
`;
