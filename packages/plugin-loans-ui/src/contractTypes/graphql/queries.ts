export const contractTypeFields = `
  _id
  code
  name
  description
  status
  number
  vacancy
  leaseType
  currency

  defaultInterest
  useSkipInterest
  skipInterestDay
  skipInterestMonth
  skipPaymentDay
  skipPaymentMonth

  lossPercent
  lossCalcType
  skipLossDay
  allowLateDay

  allowPartOfLease
  limitIsCurrent
  commitmentInterest

  useMargin
  useDebt
  useManualNumbering

  savingPlusLoanInterest
  savingUpperPercent

  config
  productId
  productType

  feePercent
  defaultFee
  useCollateral
  minPercentMargin

  overPaymentIsNext
  collectivelyRule
  
  createdAt
  modifiedAt

  product {
    _id
    code
    name
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

export const contractTypes = `
  query contractTypes(${listParamsDef}) {
    contractTypes(${listParamsValue}) {
      ${contractTypeFields}
    }
  }
`;

export const contractTypesMain = `
  query contractTypesMain(${listParamsDef}) {
    contractTypesMain(${listParamsValue}) {
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
  query contractTypeDetail($_id: String!) {
    contractTypeDetail(_id: $_id) {
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
