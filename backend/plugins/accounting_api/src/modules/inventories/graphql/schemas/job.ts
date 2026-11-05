export const types = `
  type JobCost {
    name: String!
    amount: Float!
    accountId: String!
  }

  input JobCostInput {
    name: String!
    amount: Float!
    accountId: String!
  }

  type JobItem {
    productId: String
    product: Product
    uom: String
    quantity: Float
    costRatio: Float
  }

  input JobItemInput {
    productId: String!
    uom: String
    quantity: Float!
    costRatio: Float
  }

  type Job {
    _id: String!
    code: String
    name: String
    description: String
    duration: Float
    durationType: String
    laborCosts: [JobCost!]!
    overheadCosts: [JobCost!]!
    inputs: [JobItem]
    outputs: [JobItem]
    status: String
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
  }

  type Jobs {
    jobs: [Job],
    totalCount: Float,
  }

  type JobOutputRow {
    _id: String!
    job: Job!
    output: JobItem!
    outputIndex: Int!
  }

  type JobOutputs {
    rows: [JobOutputRow!]!
    totalCount: Int!
  }
`;

const jobListParams = `
  searchValue: String,
  status: String,
  laborCostName: String,
  overheadCostName: String,
  hasLabor: Boolean,
  hasOverhead: Boolean,
  inputProductId: String,
  outputProductId: String,
  durationType: String,
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const queries = `
  jobs(${jobListParams}): Jobs
  jobOutputs(${jobListParams} duplicatedOutput: Boolean): JobOutputs
  jobDetail(_id: String!): Job
`;

export const mutations = `
  jobAdd(
    code: String,
    name: String!,
    description: String,
    duration: Float,
    durationType: String,
    laborCosts: [JobCostInput!],
    overheadCosts: [JobCostInput!],
    inputs: [JobItemInput!]!,
    outputs: [JobItemInput!]!,
    status: String,
  ): Job
  jobEdit(
    _id: String!,
    code: String,
    name: String!,
    description: String,
    duration: Float,
    durationType: String,
    laborCosts: [JobCostInput!],
    overheadCosts: [JobCostInput!],
    inputs: [JobItemInput!]!,
    outputs: [JobItemInput!]!,
    status: String,
  ): Job
  jobRemove(_id: String!): JSON
`;
