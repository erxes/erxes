export const QPAY_ENDPOINT = "https://merchant.qpay.mn";
export const SOCIALPAY_ENDPOINT = "https://instore.golomtbank.com";

export const PAYMENT_TYPES = {
  QPAY: "qpay",
  SOCIAL_PAY: "socialPay",

  ALL: ["qpay", "socialPay"]
};

export const QPAY_ACTIONS = {
  GET_TOKEN: "/v2/auth/token",
  INVOICE: "/v2/invoice"
};

export const SOCIALPAY_ACTIONS = {
  INVOICE_PHONE: "/pos/invoice/phone",
  INVOICE_QR: "/pos/invoice/qr",
  INVOICE_CHECK: "/pos/invoice/check",
  INVOICE_CANCEL: "/pos/invoice/cancel"
};

export const POST_CALLBACK_TYPES = {
  SOCIAL_PAY: "socialPay",

  ALL: ["socialPay"]
};

export const PAYMENT_STATUS = {
  PAID: "paid",
  CANCELLED: "cancelled",
  PENDING: "pending",
  REFUNDED: "refunded",
 
  ALL: ["paid", "cancelled", "pending", "refunded"]
}