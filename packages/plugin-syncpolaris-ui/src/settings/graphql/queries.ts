
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
  $isDeposit: Boolean
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
  isDeposit: $isDeposit
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

export const contractTypes = `
  query SavingsContractTypes(${listParamsDef}) {
    savingsContractTypes(${listParamsValue}) {
      ${contractTypeFields}
    }
  }
`;

export default {
  configs,
  list,
  totalCount,
  listSyncpolarisTypes,
  contractTypes,
};
