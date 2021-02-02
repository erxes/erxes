export const types = `
  type ClientPortal {
    _id: String!
    name: String!
    description: String
    url: String
    logo: String
    icon: String
    domain: String
    dnsStatus: String
    knowledgeBaseLabel: String
    knowledgeBaseTopicId: String
    ticketLabel: String
    taskLabel: String
    taskStageId: String
    taskPipelineId: String
    taskBoardId: String
    ticketStageId: String
    ticketPipelineId: String
    ticketBoardId: String
  }
`;

export const queries = `
  getConfigs(page: Int, perPage: Int): [ClientPortal]
  getConfig(_id: String!): ClientPortal
  getClientPortalTotalCount: Int
  getTaskStages(stageId: String!): JSON
  getTasks(stageId: String!): JSON
`;

export const mutations = `
  configUpdateClientPortal(
    _id: String
    name: String
    description: String
    logo: String
    icon: String
    url: String
    domain: String
    knowledgeBaseLabel: String
    knowledgeBaseTopicId: String
    ticketLabel: String
    taskLabel: String
    taskStageId: String
    taskPipelineId: String
    taskBoardId: String
    ticketStageId: String
    ticketPipelineId: String
    ticketBoardId: String
  ): JSON
`;
