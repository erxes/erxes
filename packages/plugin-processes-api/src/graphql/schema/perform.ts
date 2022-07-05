export const types = `

  type Perform @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    dueDate: Date,
    startAt: Date,
    endAt: Date,
    overallWorkId: String,
    status: String,
    productId: String,
    count: String,
    needProducts: JSON,
    resultProducts: JSON
  }
`;

const qryParams = `
  searchValue: String
`;

export const queries = `
  performs(page: Int, perPage: Int, ${qryParams}): [Perform]
  performsByOverallWorkId(overallWorkId: String, ${qryParams}):  [Perform]
  performsTotalCount(${qryParams}): Int
`;

const performParams = `
  startAt: Date,
  endAt: Date,
  dueDate: Date,
  overallWorkId: String,
  status: String,
  productId: String,
  count: String,
  needProducts: [JobProductsInput],
  resultProducts: [JobProductsInput]
`;

export const mutations = `
  performsAdd(${performParams}): Perform
`;
