export const types = `
  type Script {
    _id: String!
    name: String!
    messengerId: String
    kbTopicId: String
    leadIds: [String]

    messenger: Integration
    leads: [Integration]
    kbTopic: KnowledgeBaseTopic
  }
`;

export const queries = `
  scripts(page: Int, perPage: Int): [Script]
  scriptsTotalCount: Int
`;

export const mutations = `
  scriptsAdd(
    name: String!
    messengerId: String
    kbTopicId: String
    leadIds: [String]
  ): Script

  scriptsEdit(
    _id: String!,
    name: String!
    messengerId: String
    kbTopicId: String
    leadIds: [String]
  ): Script

  scriptsRemove(_id: String!): JSON
`;
