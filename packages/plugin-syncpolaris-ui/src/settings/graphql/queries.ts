
const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

const list = `
  query listQuery($typeId: String) {
    syncpolariss(typeId: $typeId) {
      _id
      name
      expiryDate
      createdAt
      checked
      typeId
      currentType{
        _id
        name
      }
    }
  }
`;

const listSyncpolarisTypes = `
  query listSyncpolarisTypeQuery{
    syncpolarisTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query syncpolarissTotalCount{
    syncpolarissTotalCount
  }
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

export const contractTypeFields = `
  _id
  code
  name
  status
  number
  vacancy
  createdAt
  config
  branchId
  isAllowIncome
  isAllowOutcome
  isDeposit
`;

export const savingsContractTypes = `
  query SavingsContractTypes(${listParamsDef}, $isDeposit: Boolean) {
    savingsContractTypes(${listParamsValue}, isDeposit: $isDeposit) {
      ${contractTypeFields}
    }
  }
`;

export const loansContractTypes = `
  query LoansContractTypes(${listParamsDef}) {
    loansContractTypes(${listParamsValue}) {
      ${contractTypeFields}
    }
  }
`;

export default {
  configs,
  list,
  totalCount,
  listSyncpolarisTypes,
  savingsContractTypes,
  loansContractTypes
};
