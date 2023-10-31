import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity';

const contractFields = `
  _id
  contractTypeId
  number
  branchId
  status
  description
  createdBy
  createdAt
  savingAmount
  duration
  interestRate
  closeInterestRate
  startDate
  customerId
  customerType
  closeDate
  closeType
  closeDescription
  dealId
  hasTransaction
  currency
  closeInterestRate
  interestCalcType
  storedInterest
  endDate
  isAllowIncome
  isAllowOutcome
  isDeposit
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $searchValue: String
  $isExpired: String
  $startStartDate:Date
  $endStartDate:Date
  $startCloseDate:Date
  $endCloseDate:Date
  $dealId: String
  $customerId: String
  $sortField: String
  $sortDirection: Int
  $contractTypeId: String
  $interestRate: Float
  ${conformityQueryFields}
  $closeDate: Date
  $closeDateType:String
  $branchId:String
  $status:String
  $isDeposit:Boolean
`;

const listParamsMainDef = `
  ${listParamsDef}
  $ids: [String]
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  searchValue: $searchValue
  isExpired: $isExpired
  startStartDate: $startStartDate
  endStartDate: $endStartDate
  startCloseDate: $startCloseDate
  endCloseDate: $endCloseDate
  dealId: $dealId
  customerId: $customerId
  sortField: $sortField
  sortDirection: $sortDirection
  contractTypeId: $contractTypeId
  interestRate: $interestRate
  ${conformityQueryFieldDefs}
  closeDate: $closeDate
  closeDateType: $closeDateType
  branchId: $branchId
  status: $status
  isDeposit: $isDeposit
`;

const listParamsMainValue = `
  ${listParamsValue}
  ids: $ids
`;

export const contracts = `
  query savingsContracts(${listParamsDef}) {
    savingsContracts(${listParamsValue}) {
      ${contractFields}
      
    }
  }
`;

export const contractsMain = `
  query savingsContractsMain(${listParamsMainDef}) {
    savingsContractsMain(${listParamsMainValue}) {
      list {
        ${contractFields}
      }
      totalCount
    }
  }
`;

export const contractDetailFields = `
  branchId
  
  contractType {
    code
    name
  }

  customers {
    _id
    firstName
    lastName
    primaryEmail
    primaryPhone
  }
  companies {
    _id
    primaryName
    website
  }
  interestGiveType
  closeOrExtendConfig
  depositAccount
  storedInterest
  storeInterestInterval
`;

export const contractDetail = `
  query savingsContractDetail($_id: String!) {
    savingsContractDetail(_id: $_id) {
      ${contractFields}
      ${contractDetailFields}
    }
  }
`;

export const schedules = `
  query savingsTransactions($contractId: String!) {
    savingsTransactions(contractId: $contractId) {
      number
      payDate
      payment
      total
    }
  }
`;

export const scheduleYears = `
  query scheduleYears($contractId: String!) {
    scheduleYears(contractId: $contractId) {
      year
    }
  }
`;

export const closeInfo = `
  query savingsCloseInfo($contractId: String, $date: Date) {
    savingsCloseInfo(contractId: $contractId, date: $date) {
      balance
      storedInterest
      total
    }
  }
`;

const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

const savingsContractsAlert = `
  query savingsContractsAlert($date: Date) {
    savingsContractsAlert(date: $date) {
      name
      count
      filter
    }
  }
`;

export default {
  contracts,
  contractsMain,
  contractDetail,
  schedules,
  scheduleYears,
  closeInfo,
  documents,
  savingsContractsAlert
};
