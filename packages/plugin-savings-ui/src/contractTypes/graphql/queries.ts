export const contractTypeFields = `
  _id
  code
  name
  description
  status
  number
  vacancy
  createdAt
  config
  currency
  interestCalcType
  storeInterestInterval
  branchId
  interestRate
  closeInterestRate
  isAllowIncome
  isAllowOutcome
  isDeposit
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $searchValue: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const contractTypes = `
  query SavingsContractTypes(${listParamsDef}) {
    savingsContractTypes(${listParamsValue}) {
      ${contractTypeFields}
    }
  }
`;

export const contractTypesMain = `
  query SavingsContractTypesMain(${listParamsDef}) {
    savingsContractTypesMain(${listParamsValue}) {
      list {
        ${contractTypeFields}
      }
      totalCount
    }
  }
`;

export const contractTypeCounts = `
  query contractTypeCounts(${listParamsDef}, $only: String) {
    contractTypeCounts(${listParamsValue}, only: $only)
  }
`;

export const contractTypeDetail = `
  query savingsContractTypeDetail($_id: String!) {
    savingsContractTypeDetail(_id: $_id) {
      ${contractTypeFields}
    }
  }
`;

export default {
  contractTypes,
  contractTypesMain,
  contractTypeCounts,
  contractTypeDetail
};
