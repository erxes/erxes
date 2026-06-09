export const types = `
  type MastraAgent {
    _id: String
    name: String
    agentId: String
    description: String
    instructions: String
    provider: String
    model: String
    toolIds: [String]
    memoryEnabled: Boolean
    maxSteps: Int
    isEnabled: Boolean
    createdAt: Date
    updatedAt: Date
  }

  input MastraAgentInput {
    name: String
    agentId: String
    description: String
    instructions: String
    provider: String
    model: String
    toolIds: [String]
    memoryEnabled: Boolean
    maxSteps: Int
    isEnabled: Boolean
  }
`;

export const queries = `
  mastraAgents: [MastraAgent]
  mastraAgent(_id: String!): MastraAgent
  mastraAgentChat(agentId: String!, message: String!, threadId: String): String
`;

export const mutations = `
  mastraAgentCreate(doc: MastraAgentInput!): MastraAgent
  mastraAgentUpdate(_id: String!, doc: MastraAgentInput!): MastraAgent
  mastraAgentRemove(_id: String!): JSON
`;
