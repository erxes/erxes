import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Triage {
    _id: String
    name: String
    description: String
    teamId: String
    createdBy: String
    priority: Int
    number: Int
    createdAt: Date
    updatedAt: Date
    status: Int
  }

  input ITriageAddInput {
    name: String!
    description: String
    teamId: String!
    priority: Int
    status: Int
  }

  input ITriageUpdateInput {
    name: String
    description: String
    teamId: String
    priority: Int
    status: Int
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
