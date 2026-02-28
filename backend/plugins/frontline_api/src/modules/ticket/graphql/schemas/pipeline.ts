import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Pipeline {
    _id: String!
    name: String!
    channelId: String
    description: String
    userId: String
    pipelineId: String
    createdUser: User
    state: String
    isCheckDate: Boolean
    isCheckUser: Boolean
    isCheckDepartment: Boolean
    isCheckBranch: Boolean
    isHideName: Boolean
    excludeCheckUserIds: [String]
    numberConfig: String
    numberSize: String
    nameConfig: String
    lastNum: String
    departmentIds: [String]
    branchIds: [String]
    tagId: String
    createdAt: Date
    updatedAt: Date
    visibility: String
    memberIds: [String]
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
    pipelineId:String
    userId: String
    name: String
    ${GQL_CURSOR_PARAM_DEFS}
  }
`;

export const queries = `
  getTicketPipeline(_id: String!): Pipeline
  getTicketPipelines(filter: TicketsPipelineFilter): PipelineListResponse
`;

const pipelineParams = `
    channelId:String
    pipelineId:String
    statusId:String
    description: String
    order: Int
    isCheckDate: Boolean
    isCheckUser: Boolean
    isCheckDepartment: Boolean
    isCheckBranch: Boolean
    isHideName: Boolean
    excludeCheckUserIds: [String]
    branchIds: [String]
    numberConfig: String
    numberSize: String
    nameConfig: String
    departmentIds: [String],
    nameConfig: String,
    branchIds: [String],
    visibility: String,
    memberIds :[String]
`;
export const mutations = `
  createPipeline(
    name: String!
    ${pipelineParams}
  ): Pipeline

  updatePipeline(
    _id: String!
    name: String
    ${pipelineParams}
  ): Pipeline

  removePipeline(_id: String!): JSON
`;
