import {
  conformityQueryFieldDefs,
  conformityQueryFields,
} from '@erxes/ui-sales/src/conformity';
import { contractTypeFields } from '../../contractTypes/graphql/queries';

export const contractFields = `
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
  lossPercent
  lossCalcType
  interestRate
  repayment
  startDate
  firstPayDate
  scheduleDays
  stepRules
  debt
  debtTenor
  debtLimit
  insuranceAmount
  customerId
  customerType
  relationExpertId
  leasingExpertId
  riskExpertId
  holidayType
  weekends
  relContractId
  dealId
  currency
  classification
  expiredDays
  loanBalanceAmount
  storedInterest
  lastStoredDate
  useManualNumbering
  loanPurpose
  loanDestination
  unUsedBalance
  leaseType
  commitmentInterest
  endDate
  contractDate
`;

const selectContractFields = `
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
  lossPercent
  lossCalcType
  interestRate
  repayment
  startDate
  firstPayDate
  scheduleDays
  leaseType
  commitmentInterest
  unUsedBalance
  endDate
  classification
`;

const scheduleFields = `
  _id
  contractId
  version
  createdAt
  status
  payDate

  balance
  loss
  interest
  interestEve
  interestNonce
  commitmentInterest
  payment
  insurance
  debt
  total
  giveAmount

  didLoss
  didInterest
  didInterestEve
  didInterestNonce
  didCommitmentInterest
  didPayment
  didInsurance
  didDebt
  didTotal
  surplus

  isDefault
  transactionIds
`;
const listParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int

  $ids: [String]
  $excludeIds: Boolean
  $searchValue: String
  $isExpired: String
  $repaymentDate: String
  $startStartDate:Date
  $endStartDate:Date
  $startCloseDate:Date
  $endCloseDate:Date
  $dealId: String
  $customerId: String
  $contractTypeId: String
  $leaseAmount: Float
  $interestRate: Float
  $tenor: Int
  $repayment: String
  ${conformityQueryFields}
  $closeDate: Date
  $closeDateType:String
  $branchId:String

  $dealIds: [String]
`;

const listParamsMainDef = `
  ${listParamsDef}
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection

  ids: $ids
  excludeIds: $excludeIds
  searchValue: $searchValue
  isExpired: $isExpired
  repaymentDate: $repaymentDate
  startStartDate: $startStartDate
  endStartDate: $endStartDate
  startCloseDate: $startCloseDate
  endCloseDate: $endCloseDate
  dealId: $dealId
  customerId: $customerId
  contractTypeId: $contractTypeId
  leaseAmount: $leaseAmount
  interestRate: $interestRate
  tenor: $tenor
  repayment: $repayment
  ${conformityQueryFieldDefs}
  closeDate: $closeDate
  closeDateType: $closeDateType
  branchId: $branchId

  dealIds: $dealIds
`;

const listParamsMainValue = `
  ${listParamsValue}
`;

export const contracts = `
  query contracts(${listParamsDef}) {
    contracts(${listParamsValue}) {
      ${contractFields}
    }
  }
`;

export const selectContracts = `
  query contracts(${listParamsDef}) {
    contracts(${listParamsValue}) {
      ${selectContractFields}
    }
  }
`;

export const savingContracts = `
  query savingsContracts(
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
    $closeDate: Date
    $closeDateType:String
    $branchId:String
    $status:String
    $isDeposit:Boolean
  ) {
    savingsContracts(
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
      closeDate: $closeDate
      closeDateType: $closeDateType
      branchId: $branchId
      status: $status
      isDeposit: $isDeposit
    ) {
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
        customers {
          code
          firstName
          lastName
        }
    }
  }
`;

export const contractsMain = `
  query contractsMain(${listParamsMainDef}) {
    contractsMain(${listParamsMainValue}) {
      list {
        ${contractFields}
        customer {
          code
          firstName
          lastName
        }
        contractType {
          name

        }
      }
      totalCount
    }
  }
`;

export const contractDetailFields = `
  branchId
  invoices
  storeInterest
  loanTransactionHistory
  depositAccountId
  nextPayment
  payedAmountSum
  contractType {
    ${contractTypeFields}
  }

  customer {
    _id
    firstName
    lastName
    primaryEmail
    primaryPhone
  }

  company {
    _id
    primaryName
    primaryEmail
    primaryPhone
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
  relCustomers
  hasTransaction
  nextPayment
  customFieldsData
  savingContractId
  holidayType
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
      ${scheduleFields}
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

export const convertToContract = `
  query convertToContract($id: String!, $contentType: String) {
    convertToContract(id: $id, contentType: $contentType)
  }
`;

export const closeInfo = `
  query closeInfo($contractId: String, $date: Date) {
    closeInfo(contractId: $contractId, date: $date) {
      balance
      loss
      interest
      interestEve
      interestNonce
      payment
      insurance
      storedInterest
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

const contractsAlert = `
  query contractsAlert($date: Date) {
    contractsAlert(date: $date) {
      name
      count
      filter
    }
  }
`;

const getPolarisData = `
  query getPolarisData($method: String, $data: JSON) {
    getPolarisData(method: $method, data: $data)
  }
`;

const dealContract = `
  query dealLoanContract($dealId: String, $args: JSON) {
    dealLoanContract(dealId: $dealId, args: $args)
  }
`;

export default {
  contracts,
  selectContracts,
  contractsMain,
  dealContract,
  contractDetail,
  schedules,
  scheduleYears,
  closeInfo,
  documents,
  contractsAlert,
  savingContracts,
  getPolarisData,
  convertToContract,
};
