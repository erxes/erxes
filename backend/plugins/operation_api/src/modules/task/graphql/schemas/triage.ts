export const types = `
  type Triage {
    _id: String
    name: String
    description: String
    teamId: String
    createdBy: String
  }

  input ITriageInput {
    name: String!
    description: String
    teamId: String!
    number: Int
    createdBy: String!
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
  }
`;

export const queries = `
  operationGetTriage(_id: String!): Triage
  operationGetTriageList(filter: ITriageFilter): TriageListResponse
`;

export const mutations = `
  operationAddTriage(input: ITriageInput!): Triage
  operationUpdateTriage(_id: String!, input: ITriageInput!): Triage
  operationCancelTriage(_id: String!): Triage
`;
