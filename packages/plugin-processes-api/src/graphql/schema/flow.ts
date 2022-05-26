export const types = `

  type Flow @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    name: String,
    categoryId: String,
    status: String,
    jobs: JSON,
  }

  input JobInput {
    id: String,
    nextJobIds: [String],
    jobRefer: JSON,
    style: JSON,
    label: String,
    description: String,
    quantity: Int,
  }
`;

const qryParams = `
  categoryId: String,
  searchValue: String,
  excludeIds: Boolean
`;

export const queries = `
  flows(page: Int, perPage: Int ids: [String], ${qryParams}): [Flow]
  flowTotalCount(${qryParams}): Int
  flowDetail(_id: String!): Flow
`;

const flowParams = `
  name: String,
  categoryId: String,
  status: String,
  jobs: JobInput,
`;

export const mutations = `
  flowsAdd(${flowParams}): Flow
  flowsEdit(_id: String!, ${flowParams}): Flow
  flowsRemove(_id: String!): JSON
`;
