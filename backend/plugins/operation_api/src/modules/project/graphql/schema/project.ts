import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
type Project {
    _id: String!
    name: String!
    icon: String
    description: String
    status: Int
    priority: Int
    teamIds: [String!]!
    tagIds: [String]
    leadId: String
    memberIds: [String]
    startDate: Date
    targetDate: Date
    createdBy: String
    createdAt: Date!
    updatedAt: Date!
    convertedFromId: String
    propertiesData: JSON
}


type ProjectListResponse {
    list: [Project],
    pageInfo: PageInfo
    totalCount: Int,
}

input IProjectFilter {
    _id: String
    _ids: [String]
    name: String
    description: String
    status: Int
    priority: Int
    teamIds: [String]
    tagIds: [String]
    leadId: String
    memberIds: [String]
    memberId: String
    startDate: Date
    targetDate: Date
    userId: String
    active: Boolean
    taskId: String
    ${GQL_CURSOR_PARAM_DEFS}
}

type ProjectSubscription {
    type: String
    project: Project
}

type OperationProgress {
    totalScope: Int!
    totalStartedScope: Int!
    totalCompletedScope: Int!
}

type OperationProgressByMember {
    assigneeId: String
    totalScope: Int!
    totalStartedScope: Int!
    totalCompletedScope: Int!
}

type OperationProgressByTeam {
    teamId: String
    totalScope: Int!
    totalStartedScope: Int!
    totalCompletedScope: Int!
}

type OperationProgressByProject {
    projectId: String
    totalScope: Int!
    totalStartedScope: Int!
    totalCompletedScope: Int!
}

type OperationProgressChartPoint {
    date: String!
    started: Int!
    completed: Int!
}

type OperationProgressChart {
    totalScope: Int!
    chartData: [OperationProgressChartPoint!]!
}
`;

const createProjectParams = `
  name: String!
  leadId: String
  memberIds: [String]
  icon: String
  description: String
  status: Int
  priority: Int
  teamIds: [String!]!
  tagIds: [String]
  startDate: Date
  targetDate: Date
  convertedFromId: String
  propertiesData: JSON
`;

const updateProjectParams = `
  _id: String!
  name: String
  leadId: String
  memberIds: [String]
  icon: String
  description: String
  status: Int
  priority: Int
  teamIds: [String]
  tagIds: [String]
  startDate: Date
  targetDate: Date
  propertiesData: JSON
`;

export const queries = `
    getProject(_id: String!): Project
    getProjects(filter: IProjectFilter): ProjectListResponse
    getProjectProgress(_id: String!): OperationProgress
    getProjectProgressByMember(_id: String!): [OperationProgressByMember!]!
    getProjectProgressByTeam(_id: String!): [OperationProgressByTeam!]!
    getProjectProgressChart(_id: String!): OperationProgressChart
    getConvertedProject(convertedFromId: String): Project
    cpGetProjects: [Project]
`;

export const mutations = `
  createProject(${createProjectParams}): Project
  updateProject(${updateProjectParams}): Project
  removeProject(_id: String!): JSON
`;
