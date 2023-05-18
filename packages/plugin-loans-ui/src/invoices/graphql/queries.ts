export const invoicePreInfo = `
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
export const invoiceFields = `
  _id
  createdAt
  createdBy
  customerId
  companyId
  status
  ${invoicePreInfo}
  transaction {
    payment
    interestEve
    interestNonce
    undue
    insurance
    total
  }
`;

export const invoiceOtherFields = `
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
    scheduleDay
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
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $contractId: String;
  $customerId: String;
  $companyId: String;
  $payDate: String;
  $searchValue: String
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
  payDate: $payDate
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const invoices = `
  query loanInvoices(${listParamsDef}) {
    loanInvoices(${listParamsValue}) {
      ${invoiceFields}
    }
  }
`;

export const invoicesMain = `
  query loanInvoicesMain(${listParamsDef}) {
    loanInvoicesMain(${listParamsValue}) {
      list {
        ${invoiceFields}
        ${invoiceOtherFields}
      }
      totalCount
    }
  }
`;

export const invoiceCounts = `
  query invoiceCounts(${listParamsDef}, $only: String) {
    invoiceCounts(${listParamsValue}, only: $only)
  }
`;

export const invoiceDetail = `
  query loanInvoiceDetail($_id: String!) {
    loanInvoiceDetail(_id: $_id) {
      ${invoiceFields}
      ${invoiceOtherFields}
    }
  }
`;

export const getInvoicePreInfo = `
  query getInvoicePreInfo($contractId: String!, $payDate: String) {
    getInvoicePreInfo(contractId: $contractId, payDate: $payDate) {
      ${invoicePreInfo}
    }
  }
`;

export default {
  invoices,
  invoicesMain,
  invoiceCounts,
  invoiceDetail,
  getInvoicePreInfo
};
