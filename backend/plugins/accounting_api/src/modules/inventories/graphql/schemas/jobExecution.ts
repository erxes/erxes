export const types = `
  input JobExecutionItemInput {
    _id: String!
    jobId: String!
    quantity: Float!
    inputs: [JobItemInput!]!
    outputs: [JobItemInput!]!
    laborCosts: [JobCostInput!]!
    overheadCosts: [JobCostInput!]!
  }
  type JobExecutionItem {
    _id: String!
    jobId: String!
    jobName: String
    quantity: Float!
    inputs: [JobItem!]!
    outputs: [JobItem!]!
    laborCosts: [JobCost!]!
    overheadCosts: [JobCost!]!
  }
  input JobExecutionInput {
    date: Date!
    jobs: [JobExecutionItemInput!]!
    description: String
    inputAccountId: String!
    inputBranchId: String
    inputDepartmentId: String
    outputAccountId: String!
    outputBranchId: String
    outputDepartmentId: String
  }
  type JobExecution {
    _id: String!
    date: Date!
    jobs: [JobExecutionItem!]!
    description: String
    inputAccountId: String!
    inputBranchId: String
    inputDepartmentId: String
    outputAccountId: String!
    outputBranchId: String
    outputDepartmentId: String
    status: String!
    parentId: String
    ptrId: String
    error: String
  }
  type JobExecutionList {
    rows: [JobExecution!]!
    totalCount: Int!
  }
`;
export const queries = `
  jobExecutions(
    searchValue: String, status: String, jobId: String, jobName: String,
    inputProductId: String, outputProductId: String,
    laborCostName: String, overheadCostName: String,
    inputAccountId: String, inputBranchId: String, inputDepartmentId: String,
    outputAccountId: String, outputBranchId: String, outputDepartmentId: String,
    page: Int, perPage: Int
  ): JobExecutionList!
  jobExecutionDetail(_id: String!): JobExecution!
`;
export const mutations = `
  jobExecutionSave(_id: String, input: JobExecutionInput!): JobExecution!
  jobExecutionPost(_id: String!): JobExecution!
  jobExecutionUndo(_id: String!): JobExecution!
  jobExecutionRemove(_id: String!): Boolean!
`;
