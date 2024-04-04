export const types = () => {
  return `
  type InsuranceType {
    _id: String!
    code: String
    name: String
    description: String
    companyId: String
    percent: Float
    yearPercents: [Float]
    createdBy: String
    createdAt: Date

    company: Company
  }

  type InsuranceTypesListResponse {
    list: [InsuranceType],
    totalCount: Float,
  }
`;
};

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  insuranceTypesMain(${queryParams}): InsuranceTypesListResponse
  insuranceTypes(${queryParams}): [InsuranceType]
  insuranceTypeDetail(_id: String!): InsuranceType
`;

const commonFields = `
  code: String
  name: String
  description: String
  companyId: String
  percent: Float
  yearPercents: String
  createdBy: String
  createdAt: Date
`;

export const mutations = `
  insuranceTypesAdd(${commonFields}): InsuranceType
  insuranceTypesEdit(_id: String!, ${commonFields}): InsuranceType
  insuranceTypesRemove(insuranceTypeIds: [String]): [String]
`;
