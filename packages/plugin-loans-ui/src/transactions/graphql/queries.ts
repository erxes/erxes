import { invoicePreInfo } from '../../invoices/graphql/queries';

export const transactionPreInfo = `
  contractId
  number
  payDate
  payment
  interestEve
  interestNonce
  undue
  insurance
  debt
  total
`;
export const transactionFields = `
  _id
  createdAt
  createdBy
  customerId
  companyId
  invoiceId
  status
  description
  ${transactionPreInfo}
  futureDebt
  debtTenor
`;

export const transactionOtherFields = `
  contract {
    _id
    number
    status
    description
    createdBy
    createdAt
    leaseAmount
    tenor
    interestRate
    repayment
    startDate
    scheduleDays
  }
  company {
    _id
    code
    primaryName
  }
  customer {
    _id
    code
    firstName
    lastName
    middleName
    primaryEmail
    primaryPhone
  }
  invoice {
    ${invoicePreInfo}
  }
  calcedInfo {
    payment
    interestEve
    interestNonce
    undue
    insurance
    debt
    total
  }
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $contractId: String
  $customerId: String
  $companyId: String
  $startDate: String
  $endDate: String
  $searchValue: String
  $payDate: String
  $contractHasnt: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  contractId: $contractId
  customerId: $customerId
  companyId: $companyId
  startDate: $startDate
  endDate: $endDate
  searchValue: $searchValue
  payDate: $payDate
  contractHasnt: $contractHasnt
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const transactions = `
  query transactions(${listParamsDef}) {
    transactions(${listParamsValue}) {
      ${transactionFields}
    }
  }
`;

export const transactionsMain = `
  query transactionsMain(${listParamsDef}) {
    transactionsMain(${listParamsValue}) {
      list {
        ${transactionFields}
        ${transactionOtherFields}
      }
      totalCount
    }
  }
`;

export const transactionCounts = `
  query transactionCounts(${listParamsDef}, $only: String) {
    transactionCounts(${listParamsValue}, only: $only)
  }
`;

export const transactionDetail = `
  query transactionDetail($_id: String!) {
    transactionDetail(_id: $_id) {
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

export const getPaymentInfo = `
query GetPaymentInfo($id: String!, $payDate: Date) {
  getPaymentInfo(id: $id,payDate: $payDate) {
    number
    contractId
    payDate
    payment
    interestEve
    interestNonce
    undue
    insurance
    debt
    total
    balance
    closeAmount
  }
}
`;

export default {
  transactions,
  transactionsMain,
  transactionCounts,
  transactionDetail,
  getPaymentInfo
};
