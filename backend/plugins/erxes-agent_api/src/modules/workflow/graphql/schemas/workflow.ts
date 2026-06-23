export const types = `
  type MastraWorkflow {
    _id: String
    name: String
    description: String
    definition: JSON
    version: Int
    isEnabled: Boolean
    createdByUserId: String
    createdAt: Date
    updatedAt: Date
  }

  input MastraWorkflowInput {
    name: String
    description: String
    definition: JSON
    isEnabled: Boolean
  }

  type MastraWorkflowRun {
    _id: String
    workflowId: String
    version: Int
    runId: String
    status: String
    triggerEnvelope: JSON
    stepsSummary: JSON
    output: JSON
    error: String
    usage: JSON
    startedAt: Date
    finishedAt: Date
    createdAt: Date
  }
`;

export const queries = `
  mastraWorkflows: [MastraWorkflow]
  mastraWorkflow(_id: String!): MastraWorkflow
  mastraWorkflowRuns(workflowId: String!, page: Int, perPage: Int): [MastraWorkflowRun]
`;

export const mutations = `
  mastraWorkflowCreate(doc: MastraWorkflowInput!): MastraWorkflow
  mastraWorkflowUpdate(_id: String!, doc: MastraWorkflowInput!): MastraWorkflow
  mastraWorkflowRemove(_id: String!): JSON
  mastraWorkflowSetEnabled(_id: String!, isEnabled: Boolean!): MastraWorkflow
  mastraWorkflowValidate(definition: JSON!): JSON
  mastraWorkflowRunStart(_id: String!, input: JSON): MastraWorkflowRun
`;
