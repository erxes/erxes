import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Triage {
    _id: String!
    name: String!
    description: String
    teamId: String!
    createdBy: String
    priority: Int
    number: Int
    createdAt: Date!
    updatedAt: Date!
    status: Int
    githubIssueNumber: Int
    githubIssueUrl: String
    githubRepoName: String
    customerId: String
    companyId: String
  }

  input ITriageAddInput {
    name: String!
    description: String
    teamId: String!
    priority: Int
    status: Int
    customerId: String
    companyId: String
  }

  input ITriageUpdateInput {
    name: String
    description: String
    teamId: String
    priority: Int
    status: Int
    customerId: String
    companyId: String
  }

  type TriageListResponse {
    list: [Triage],
    pageInfo: PageInfo
    totalCount: Int,
  }

  input ITriageFilter {
    _id: String
    teamId: String
    createdBy: String
    createdAt: Date
    updatedAt: Date
    name: String
    description: String
    priority: Int
    customerId: String
    companyId: String

    ${GQL_CURSOR_PARAM_DEFS}
  }
`;

export const queries = `
  operationGetTriage(_id: String!): Triage
  operationGetTriageList(filter: ITriageFilter): TriageListResponse
`;

export const mutations = `
  operationAddTriage(input: ITriageAddInput!): Triage
  operationUpdateTriage(_id: String!, input: ITriageUpdateInput!): Triage
  operationCancelTriage(_id: String!): Triage
  operationConvertTriageToTask(_id: String!, status: Int, reason: String): Task
`;
