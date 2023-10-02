import { gql } from "@apollo/client"

const ordersAddPayment = gql`
  mutation ordersAddPayment(
    $_id: String!
    $cashAmount: Float
    $mobileAmount: Float
    $paidAmounts: [PaidAmountInput]
  ) {
    ordersAddPayment(
      _id: $_id
      mobileAmount: $mobileAmount
      cashAmount: $cashAmount
      paidAmounts: $paidAmounts
    ) {
      _id
    }
  }
`

const ordersSettlePayment = gql`
  mutation ordersSettlePayment(
    $_id: String!
    $billType: String!
    $registerNumber: String
  ) {
    ordersSettlePayment(
      _id: $_id
      billType: $billType
      registerNumber: $registerNumber
    ) {
      success
      lotteryWarningMsg
      errorCode
      message
      getInformation
    }
  }
`

const generateInvoiceUrl = `
  mutation GenerateInvoiceUrl(
    $amount: Float!
    $contentType: String
    $contentTypeId: String
    $customerId: String
    $customerType: String
    $description: String
    $email: String
    $paymentIds: [String]
    $phone: String
  ) {
    generateInvoiceUrl(
      amount: $amount
      contentType: $contentType
      contentTypeId: $contentTypeId
      customerId: $customerId
      customerType: $customerType
      description: $description
      email: $email
      paymentIds: $paymentIds
      phone: $phone
    )
  }
`

const ordersFinish = gql`
  mutation OrdersFinish(
    $_id: String
    $items: [OrderItemInput]
    $totalAmount: Float
    $type: String
    $branchId: String
    $customerId: String
    $customerType: String
    $deliveryInfo: JSON
    $billType: String
    $registerNumber: String
    $slotCode: String
    $origin: String
    $dueDate: Date
  ) {
    ordersFinish(
      _id: $_id
      items: $items
      totalAmount: $totalAmount
      type: $type
      branchId: $branchId
      customerId: $customerId
      customerType: $customerType
      deliveryInfo: $deliveryInfo
      billType: $billType
      registerNumber: $registerNumber
      slotCode: $slotCode
      origin: $origin
      dueDate: $dueDate
    ) {
      _id
    }
  }
`

const ordersCancel = gql`
  mutation OrdersCancel($id: String!) {
    ordersCancel(_id: $id)
  }
`

const mutations = {
  ordersAddPayment,
  ordersSettlePayment,
  generateInvoiceUrl,
  ordersFinish,
  ordersCancel,
}

export default mutations
