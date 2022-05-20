import { orderFields, orderItemsFields } from './queries';

const addEditParamDefs = `$items: [OrderItemInput], $totalAmount: Float!, $type: String!, $customerId: String`;
const addEditParams = `items: $items, totalAmount: $totalAmount, type: $type, customerId: $customerId`;

const ordersAdd = `
  mutation ordersAdd(${addEditParamDefs}, $origin: String) {
    ordersAdd(${addEditParams}, origin: $origin) {
      ${orderFields}
      ${orderItemsFields}
    }
  }
`;

const ordersEdit = `
  mutation ordersEdit($_id: String!, ${addEditParamDefs}) {
    ordersEdit(_id: $_id, ${addEditParams}) {
      ${orderFields}
      ${orderItemsFields}
    }
  }
`;

const orderChangeStatus = `
  mutation orderChangeStatus($_id: String!, $status: String) {
    orderChangeStatus(_id: $_id, status: $status) {
      _id
    }
  }
`;

const invoiceFields = `
  _id
  amount
  qrText
  senderInvoiceNo
  status
  paymentDate
  qpayPaymentId
  status
`;

const createQpaySimpleInvoice = `
  mutation createQpaySimpleInvoice($orderId: String!, $amount: Float) {
    createQpaySimpleInvoice(orderId: $orderId, amount: $amount) {
      ${invoiceFields}
    }
  }
`;

const qpayCheckPayment = `
  mutation qpayCheckPayment($orderId: String!, $_id: String) {
    qpayCheckPayment(orderId: $orderId, _id: $_id) {
      ${invoiceFields}
    }
  }
`;

const customersAdd = `
  mutation customersAdd($firstName: String, $lastName: String, $email: String, $phone: String) {
    customersAdd(firstName: $firstName, lastName: $lastName, email: $email, phone: $phone) {
      _id
    }
  }
`;

const qpayCancelInvoice = `
  mutation qpayCancelInvoice($_id: String!) {
    qpayCancelInvoice(_id: $_id)
  }
`;

const ordersAddPayment = `
  mutation ordersAddPayment($_id: String!, $cashAmount: Float, $cardAmount: Float, $cardInfo: JSON) {
    ordersAddPayment(_id: $_id, cashAmount: $cashAmount, cardAmount: $cardAmount, cardInfo: $cardInfo) {
      ${orderFields}
      ${orderItemsFields}
    }
  }
`;

const ordersCancel = `
  mutation ordersCancel($_id: String!) {
    ordersCancel(_id: $_id)
  }
`;

const ordersSettlePayment = `
  mutation ordersSettlePayment($_id: String!, $billType: String!, $registerNumber: String) {
    ordersSettlePayment(_id: $_id, billType: $billType, registerNumber: $registerNumber) {
      success
      lotteryWarningMsg
      errorCode
      message
      getInformation
    }
  }
`;

export default {
  ordersAdd,
  ordersEdit,
  orderChangeStatus,
  createQpaySimpleInvoice,
  qpayCheckPayment,
  customersAdd,
  qpayCancelInvoice,
  ordersAddPayment,
  ordersCancel,
  ordersSettlePayment
};
