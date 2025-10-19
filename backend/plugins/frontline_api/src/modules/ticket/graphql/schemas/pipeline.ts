import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `

  type Pipeline {
    _id: String!
    name: String!
    channelId: String!
    description: String
    userId: String
    createdAt: Date
    updatedAt: Date
    pipelineId: String
    createdUser: User
  }

  type PipelineSubscription {
    type: String
    pipeline: Pipeline
  }

  type PipelineListResponse {
    list: [Pipeline]
    pageInfo: PageInfo
    totalCount: Int
  }

  input TicketsPipelineFilter {
    channelId: String
    userId: String
    name: String
    ${GQL_CURSOR_PARAM_DEFS}
  }
`;

export const queries = `
  getTicketPipeline(_id: String!): Pipeline
  getTicketPipelines(filter: TicketsPipelineFilter): PipelineListResponse
`;

export const mutations = `
  createPipeline(
    name: String!
    channelId: String!
    description: String
    order: Int
  ): Pipeline

  updatePipeline(
    _id: String!
    name: String
    description: String
    order: Int
  ): Pipeline

  removePipeline(_id: String!): JSON
`;
