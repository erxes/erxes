export const types = `
  type MastraAgentSkill {
    _id: String
    name: String
    title: String
    description: String
    body: String
    tags: [String]
    agentIds: [String]
    isEnabled: Boolean
    createdByUserId: String
    usageCount: Float
    lastUsedAt: Date
    createdAt: Date
    updatedAt: Date
  }

  input MastraAgentSkillInput {
    name: String!
    title: String!
    description: String!
    body: String!
    tags: [String]
    agentIds: [String]
    isEnabled: Boolean
  }

  input MastraAgentSkillEditInput {
    name: String
    title: String
    description: String
    body: String
    tags: [String]
    agentIds: [String]
    isEnabled: Boolean
  }
`;

export const queries = `
  mastraAgentSkills(agentId: String): [MastraAgentSkill]
  mastraAgentSkill(_id: String!): MastraAgentSkill
`;

export const mutations = `
  mastraAgentSkillAdd(doc: MastraAgentSkillInput!): MastraAgentSkill
  mastraAgentSkillEdit(_id: String!, doc: MastraAgentSkillEditInput!): MastraAgentSkill
  mastraAgentSkillRemove(_id: String!): JSON
`;
