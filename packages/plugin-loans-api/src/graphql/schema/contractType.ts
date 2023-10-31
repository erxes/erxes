export const types = () => `
  type ContractType {
    _id: String!
    code: String
    name: String
    description: String
    status: String
    number: String
    vacancy: Float
    unduePercent: Float
    undueCalcType: String
    useMargin: Boolean
    useSkipInterest: Boolean
    useDebt: Boolean
    useManualNumbering: Boolean
    useFee: Boolean
    leaseType: String
    createdAt: Date
    productCategoryIds: [String]
    config: JSON

    productCategories: [ProductCategory]
    currency:String
  }

  type ContractTypesListResponse {
    list: [ContractType],
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
  contractTypesMain(${queryParams}): ContractTypesListResponse
  contractTypes(${queryParams}): [ContractType]
  contractTypeDetail(_id: String!): ContractType
`;

const commonFields = `
  code: String
  name: String
  description: String
  status: String
  number: String
  vacancy: Float
  unduePercent: Float 
  undueCalcType: String
  useMargin: Boolean
  useSkipInterest: Boolean
  useManualNumbering: Boolean
  useDebt: Boolean
  leaseType: String
  createdAt: Date
  productCategoryIds: [String]
  config: JSON
  currency:String
`;

export const mutations = `
  contractTypesAdd(${commonFields}): ContractType
  contractTypesEdit(_id: String!, ${commonFields}): ContractType
  contractTypesRemove(contractTypeIds: [String]): [String]
`;
