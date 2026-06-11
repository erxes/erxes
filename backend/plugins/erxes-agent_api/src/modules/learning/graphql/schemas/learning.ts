export const types = `
  type MastraLearning {
    _id: String
    statement: String
    type: String
    contextTags: [String]
    agentId: String
    status: String
    confidence: Float
    evidenceCount: Int
    # Distinct (hashed) contributors — the k-anonymity counter. Raw hashes are
    # never exposed, only their count.
    sourceCount: Int
    pinned: Boolean
    createdBy: String
    reviewedByUserId: String
    lastReinforcedAt: Date
    createdAt: Date
    updatedAt: Date
  }

  type MastraLearningListResponse {
    list: [MastraLearning]
    totalCount: Int
  }

  type MastraLearningStatus {
    enabled: Boolean
    embedder: String
    embedderModel: String
    qdrantUrl: String
    collection: String
    autoPromoteMinSources: Int
    autoPromoteMinConfidence: Float
  }

  input MastraLearningInput {
    statement: String!
    type: String!
    contextTags: [String]
    agentId: String
  }
`;

export const queries = `
  mastraLearnings(status: String, type: String, agentId: String, searchValue: String, page: Int, perPage: Int): MastraLearningListResponse
  mastraLearning(_id: String!): MastraLearning
  mastraLearningStats: JSON
  mastraLearningStatus: MastraLearningStatus
  mastraMessageFeedbacks(threadId: String!): JSON
`;

export const mutations = `
  mastraLearningAdd(doc: MastraLearningInput!): MastraLearning
  mastraLearningEdit(_id: String!, doc: MastraLearningInput!): MastraLearning
  mastraLearningSetStatus(_id: String!, status: String!): MastraLearning
  mastraLearningPin(_id: String!, pinned: Boolean!): MastraLearning
  mastraLearningRemove(_id: String!): JSON
  mastraMessageFeedback(messageId: String!, rating: Int!, comment: String): JSON
`;
