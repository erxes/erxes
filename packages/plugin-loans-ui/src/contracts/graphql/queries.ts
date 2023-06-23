import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity';

const contractFields = `
  _id
  contractTypeId
  number
  status
  description
  createdBy
  createdAt
  marginAmount
  leaseAmount
  feeAmount
  tenor
  unduePercent
  undueCalcType
  interestRate
  repayment
  startDate
  scheduleDays
  debt
  debtTenor
  debtLimit
  insuranceAmount
  salvageAmount
  salvagePercent
  salvageTenor
  customerId
  customerType
  relationExpertId
  leasingExpertId
  riskExpertId
  weekends
  useHoliday
  useMargin
  useSkipInterest
  useDebt
  relContractId
  skipInterestCalcMonth
  dealId
  nextPayment
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $searchValue: String
  $isExpired: String
  $repaymentDate: String
  $startStartDate:Date
  $endStartDate:Date
  $startCloseDate:Date
  $endCloseDate:Date
  $dealId: String
  $customerId: String
  $sortField: String
  $sortDirection: Int
  $contractTypeId: String
  $leaseAmount: Float
  $interestRate: Float
  $tenor: Int
  $repayment: String
  ${conformityQueryFields}
  $closeDate: Date
  $closeDateType:String
  $branchId:String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  searchValue: $searchValue
  isExpired: $isExpired
  repaymentDate: $repaymentDate
  startStartDate: $startStartDate
  endStartDate: $endStartDate
  startCloseDate: $startCloseDate
  endCloseDate: $endCloseDate
  dealId: $dealId
  customerId: $customerId
  sortField: $sortField
  sortDirection: $sortDirection
  contractTypeId: $contractTypeId
  leaseAmount: $leaseAmount
  interestRate: $interestRate
  tenor: $tenor
  repayment: $repayment
  ${conformityQueryFieldDefs}
  closeDate: $closeDate
  closeDateType: $closeDateType
  branchId: $branchId
`;

export const contracts = `
  query contracts(${listParamsDef}) {
    contracts(${listParamsValue}) {
      ${contractFields}
    }
  }
`;

export const contractsMain = `
  query contractsMain(${listParamsDef}) {
    contractsMain(${listParamsValue}) {
      list {
        ${contractFields}
      }
      totalCount
    }
  }
`;

export const contractDetailFields = `
  branchId
  classification
  contractType {
    code
    name
    productCategoryIds
    leaseType
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

  collateralsData
  collaterals
  insurancesData
  insurances

  relationExpert
  leasingExpert
  riskExpert

  closeDate
  closeType
  closeDescription

  relContract {
    _id
    number
    startDate
    closeDate
    closeType
  }
  hasTransaction
`;

export const contractDetail = `
  query contractDetail($_id: String!) {
    contractDetail(_id: $_id) {
      ${contractFields}
      ${contractDetailFields}
    }
  }
`;

export const schedules = `
  query schedules($contractId: String!, $isFirst: Boolean, $year: Float) {
    schedules(contractId: $contractId, isFirst: $isFirst, year: $year) {
      _id
      contractId
      version
      createdAt
      status
      payDate

      balance
      undue
      interest
      interestEve
      interestNonce
      payment
      insurance
      debt
      total

      didUndue
      didInterest
      didInterestEve
      didInterestNonce
      didPayment
      didInsurance
      didDebt
      didTotal
      surplus

      isDefault
      transactionIds
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
  query closeInfo($contractId: String, $date: Date) {
    closeInfo(contractId: $contractId, date: $date) {
      balance
      undue
      interest
      interestEve
      interestNonce
      payment
      insurance
      debt
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

export default {
  contracts,
  contractsMain,
  contractDetail,
  schedules,
  scheduleYears,
  closeInfo,
  documents
};
