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
  interestRate
  repayment
  startDate
  scheduleDay
  debt
  debtTenor
  debtLimit
  insuranceAmount
  salvageAmount
  salvagePercent
  salvageTenor

  relationExpertId
  leasingExpertId
  riskExpertId
  weekends
  useHoliday

  relContractId
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $searchValue: String
  $sortField: String
  $sortDirection: Int
  $contractTypeId: String
  ${conformityQueryFields}
  $closeDate: Date
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
  contractTypeId: $contractTypeId
  ${conformityQueryFieldDefs}
  closeDate: $closeDate
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

export default {
  contracts,
  contractsMain,
  contractDetail,
  schedules,
  scheduleYears,
  closeInfo
};
