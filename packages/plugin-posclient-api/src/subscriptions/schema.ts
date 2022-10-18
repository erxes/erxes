import { ordersQueryParams } from '../graphql/schema/orders';

const commonFields = `
  _id: String!
  createdAt: Date
`;

const orderFields = `
  status: String
  customerId: String
  number: String
`;

const paymentInputDefs = `
  cashAmount: Float
  receivableAmount: Float
  billType: String
  registerNumber: String
  mobileAmount: Float
  cardAmount: Float
`;
export const types = `
  type PosOrderItem {
    ${commonFields}
    productId: String!
    count: Int!
    orderId: String!
    unitPrice: Float
    discountAmount: Float
    discountPercent: Float
    bonusCount: Float
    productName: String
    isPackage: Boolean
    isTake: Boolean
    productImgUrl: String
    status: String
  }

  type PosPutResponse {
    createdAt: Date
    date: String
    contentType: String
    contentId: String
    amount: String
    billType: String
    cashAmount: String
    nonCashAmount: String
    customerNo: String
    cityTax: String
    vat: String
    taxType: String
    registerNo: String
    billId: String
    macAddress: String
    lottery: String
    qrData: String
    success: String
    customerName: String
    modifiedAt: Date
    sendInfo: JSON
    internalCode: String
    lotteryWarningMsg: String
    errorCode: String
    message: String
    getInformation: String
    returnBillId: String
  }

  type CardPayment {
    _id: String
    amount: Float
    cardInfo: JSON
  }


  type Order {
    ${commonFields}
    ${orderFields}
    ${paymentInputDefs}

    paidDate: Date
    modifiedAt: Date
    totalAmount: Float
    finalAmount: Float
    shouldPrintEbarimt: Boolean
    printedEbarimt: Boolean
    billId: String
    oldBillId: String
    type: String
    branchId: String
    departmentId: String
    deliveryInfo: JSON
    cardPaymentInfo: String
    cardPayments: [CardPayment]
    origin: String
    items: [PosOrderItem]
    putResponses: [PosPutResponse]
    slotCode: String
  }
`;

export const queries = `
  fullOrders(${ordersQueryParams}): [Order]
`;
