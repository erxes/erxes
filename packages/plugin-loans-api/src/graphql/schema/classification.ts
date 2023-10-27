export const types = () => `

  type Classification_Dtl {
      amount: Float
      contractId: String
      currency: String
  }

  type Loan_Classification {
    _id: String
    description: String
    invDate: Date
    total: Float
    classification: String
    newClassification: String
    dtl: [Classification_Dtl]
  }

  type ClassificationListResponse {
    list: [Loan_Classification],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  classifications(${queryParams}): ClassificationListResponse
  classificationDetail(_id: String!): Loan_Classification
`;

const commonFields = `
  description: String
  invDate: Date
  total: Float
  classification: String
  newClassification: String
  dtl: JSON
`;

const commonManyFields = `
    classifications: JSON
`;

export const mutations = `
  classificationsAdd(${commonManyFields}): [Loan_Classification]
  classificationAdd(${commonFields}): Loan_Classification
  classificationEdit(_id: String!, ${commonFields}): Loan_Classification
  classificationRemove(classificationIds: [String]): [String]
`;
