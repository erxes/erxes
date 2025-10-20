export const types = `
  type Agent {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getAgent(_id: String!): Agent
  getAgents: [Agent]
`;

export const mutations = `
  createAgent(name: String!): Agent
  updateAgent(_id: String!, name: String!): Agent
  removeAgent(_id: String!): Agent
`;
