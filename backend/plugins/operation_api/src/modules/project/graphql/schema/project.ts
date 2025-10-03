import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
type Project {
    _id: String
    name: String
    icon: String
    description: String
    status: Int
    priority: Int
    teamIds: [String]!
    leadId: String
    startDate: Date
    targetDate: Date
    createdAt: Date
    updatedAt: Date
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
    leadId: String
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
`;

const createProjectParams = `
  name: String!
  leadId: String
  icon: String
  description: String
  status: Int
  priority: Int
  teamIds: [String!]!
  startDate: Date
  targetDate: Date
`;

const updateProjectParams = `
  _id: String!
  name: String
  leadId: String
  icon: String
  description: String
  status: Int
  priority: Int
  teamIds: [String]
  startDate: Date
  targetDate: Date
`;

export const queries = `
    getProject(_id: String!): Project
    getProjects(filter: IProjectFilter): ProjectListResponse
    getProjectProgress(_id: String!): JSON
    getProjectProgressByMember(_id: String!): JSON
    getProjectProgressByTeam(_id: String!): JSON
    getProjectProgressChart(_id: String!): JSON
`;

export const mutations = `
  createProject(${createProjectParams}): Project
  updateProject(${updateProjectParams}): Project
  removeProject(_id: String!): JSON
`;
