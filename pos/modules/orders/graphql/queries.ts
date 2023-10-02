import { gql } from "@apollo/client"

const commonFields = `
  _id
  name
  code
`

export const orderFields = `
  createdAt
  modifiedAt
  status
  slotCode
  customerId
  customerType
  printedEbarimt
  origin
  type
  description
  isPre
`
export const orderItemBaseFields = `
 _id
 discountAmount
`
export const orderItemFields = `
    ${orderItemBaseFields}
    unitPrice
    productName
    count
    productId
    isPackage
    isTake
    status
    productImgUrl
    discountPercent
    bonusCount
    manufacturedDate
    description
    attachment
`

const customerFields = `
  _id
  primaryPhone
  firstName
  primaryEmail
  lastName
`

const putResponseFields = `
  date
  vat
  cityTax
  registerNo
  billId
  lottery
  qrData
  success
  lotteryWarningMsg
  errorCode
  message
  getInformation
  returnBillId
  billType
  taxType
  stocks
  amount
`

const commonDetailFields = `
  _id
  paidDate
  cashAmount
  totalAmount
  mobileAmount
  number
  registerNumber
  billType
  billId
  paidAmounts {
    _id
    amount
    info
    type
  }
`

const orderDetail = gql`
  query orderDetail($_id: String) {
    orderDetail(_id: $_id) {
      ${commonDetailFields}
      ${orderFields}
      items {
        ${orderItemFields}
      }
      customer {
        ${customerFields}
      }
      dueDate
      customerType
    }
  }
`

const historyItemDetail = gql`
  query OrderPaymentDetail($_id: String) {
    orderDetail(_id: $_id) {
      cashAmount
      mobileAmount
      paidAmounts {
        amount
        type
      }
    }
  }
`

const historyDetail = gql`
  query HistoryDetail($id: String) {
    orderDetail(_id: $id) {
      _id
      createdAt
      status
      number
      dueDate
      modifiedAt
      type
      slotCode
      user {
        primaryPhone
        primaryEmail
        email
      }
      cashAmount
      mobileAmount
      totalAmount
      finalAmount
      paidAmounts {
        _id
        type
        amount
        info
      }
      paidDate
      billType
      customerType
      customer {
        primaryPhone
        firstName
        primaryEmail
        lastName
      }

      description

      items {
        ${orderItemFields}
      }
      registerNumber
      printedEbarimt
      billId
      putResponses {
        ${putResponseFields}
      }
    }
  }
`

const ebarimtDetail = gql`
  query EbarimtDetail($_id: String) {
    orderDetail(_id: $_id) {
      ${commonDetailFields}
      items {
        ${orderItemBaseFields}
      }
      customer {
        ${customerFields}
      }
      putResponses {
        ${putResponseFields}
      }
      user {
        ${customerFields}
      }
    }
  }
`

export const progressDetail = gql`
  query ProgressDetail($id: String) {
    orderDetail(_id: $id) {
      _id
      modifiedAt
      number
      items {
        _id
        productName
        unitPrice
        count
      }
      description
      type
    }
  }
`

export const ordersCheckCompany = `
  query ordersCheckCompany($registerNumber: String!) {
    ordersCheckCompany(registerNumber: $registerNumber)
  }
`

export const queryParamsDefs = `
  $searchValue: String,
  $statuses: [String],
  $customerId: String,
  $customerType: String,
  $startDate: Date,
  $endDate: Date,
  $dateType: String,
  $isPaid: Boolean,
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int
`

export const queryParamsValues = `
  searchValue: $searchValue,
  statuses: $statuses,
  customerId: $customerId,
  customerType: $customerType,
  startDate: $startDate,
  endDate: $endDate,
  dateType: $dateType,
  isPaid: $isPaid,
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
`

const fullOrders = gql`
  query fullOrders(${queryParamsDefs}) {
    fullOrders(${queryParamsValues}) {
      ${orderFields}
      items {
        _id
        unitPrice
        orderId
        productName
        count
        productId
        isPackage
        isTake
        status
      }
    }
  }
`

const ordersAtWaiting = gql`
  query OrdersAtWaiting(${queryParamsDefs}) {
    fullOrders(${queryParamsValues}) {
      modifiedAt
      number
      status
      _id
    }
  }
`

const activeOrders = gql`
query ActiveOrders(${queryParamsDefs}) {
  fullOrders(${queryParamsValues}) {
    _id
    status
    number
    type
    paidDate
    origin
    slotCode
  }
}
`

const ordersHistory = gql`
  query OrdersHistory(${queryParamsDefs}) {
    fullOrders(${queryParamsValues}) {
      _id
      status
      number
      totalAmount
      type
      createdAt
      modifiedAt
      paidDate
    }
  }
`

const progressHistory = gql`
  query ProgressHistory(${queryParamsDefs}) {
    fullOrders(${queryParamsValues}) {
      _id
      status
      number
      type
      items {
        _id
        isTake
        isPackage
        productName
        count
        status
        attachment
        description
      }
      modifiedAt
      paidDate
      dueDate
      description
    }
  }
`

const progressDoneOrders = gql`
 query ProgressDone(${queryParamsDefs}) {
   fullOrders(${queryParamsValues}) {
     _id
     status
     number
     type
   }
 }
`

const slots = `
  query poscSlots {
    poscSlots{
      _id
      code
      name
    }
  }
`

const ordersTotalCount = gql`
  query OrdersTotalCount(
    ${queryParamsDefs}
  ) {
    ordersTotalCount(
      ${queryParamsValues}
    )
  }
`

const queries = {
  commonFields,
  orderFields,
  orderItemFields,
  orderDetail,
  ordersCheckCompany,
  fullOrders,
  slots,
  ordersTotalCount,
  ordersHistory,
  activeOrders,
  historyDetail,
  progressHistory,
  progressDoneOrders,
  progressDetail,
  ordersAtWaiting,
  historyItemDetail,
  ebarimtDetail,
}

export default queries
