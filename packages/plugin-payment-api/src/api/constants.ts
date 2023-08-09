export const PAYMENTS = {
  qpay: {
    title: 'Qpay',
    kind: 'qpay',
    apiUrl: 'https://merchant.qpay.mn/v2',
    actions: {
      getToken: 'auth/token',
      invoice: 'invoice'
    },
    handlerMethod: 'GET'
  },

  qpayQuickqr: {
    title: 'Qpay',
    kind: 'qpayQuickqr',
    apiUrl: 'https://sandbox-quickqr.qpay.mn/v2',
    actions: {
      auth: 'auth/token',
      refresh: 'auth/refresh',
      createCompany: 'merchant/company',
      createPerson: 'merchant/person',
      getMerchant: 'merchant',
      merchantList: 'merchant/list',
      checkInvoice: 'payment/check',
      invoice: 'invoice'
    }
  },
  socialpay: {
    title: 'Social Pay',
    kind: 'socialpay',
    apiUrl: 'https://instore.golomtbank.com',
    actions: {
      invoicePhone: 'pos/invoice/phone',
      invoiceQr: 'pos/invoice/qr',
      invoiceCheck: 'pos/invoice/check',
      invoiceCancel: 'pos/invoice/cancel'
    },
    handlerMethod: 'POST'
  },
  monpay: {
    title: 'MonPay',
    kind: 'monpay',
    apiUrl: 'https://wallet.monpay.mn',
    actions: {
      invoiceQr: 'rest/branch/qrpurchase/generate',
      invoiceCheck: 'rest/branch/qrpurchase/check',
      couponScan: 'rest/branch/coupon/scan',
      branchLogin: 'rest/branch/login'
    },
    handlerMethod: 'GET'
  },
  storepay: {
    title: 'storepay',
    kind: 'storepay',
    apiUrl: 'http://service-merchant.storepay.mn:7005',
    actions: {
      invoice: 'invoice'
    },
    handlerMethod: 'GET'
  },
  pocket: {
    title: 'pocket',
    kind: 'pocket',
    apiUrl: 'https://service.invescore.mn/merchant',
    actions: {
      invoice: 'invoice',
      checkInvoice: 'invoice/check',
      webhook: 'pg/config',
      cancel: 'payment-gateway/transaction/cancel'
    },
    handlerMethod: 'GET'
  },
  wechatpay: {
    title: 'WeChat Pay',
    kind: 'wechatpay',
    apiUrl: 'https://sandbox-wechat.qpay.mn/v2',
    actions: {
      getToken: 'auth/token',
      invoice: 'invoice',
      getPayment: 'payment'
    },
    handlerMethod: 'POST'
  },
  paypal: {
    kind: 'paypal',
    apiUrl: 'https://api-m.sandbox.paypal.com',
    actions: {
      getToken: 'v1/oauth2/token',
      draftInvoice: 'v2/invoicing/invoices'
    },
    handlerMethod: 'POST'
  },

  ALL: [
    'qpay',
    'socialpay',
    'monpay',
    'storepay',
    'pocket',
    'wechatpay',
    'paypal',
    'qpayQuickqr'
  ]
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',

  ALL: ['paid', 'pending', 'refunded', 'failed', 'cancelled', 'rejected']
};

export const PLUGIN_RESOLVERS_META = {
  'inbox:conversations': {
    action: 'getConversation',
    queryKey: 'conversationId'
  },
  'cards:deals': { action: 'deals.findOne', queryKey: '_id' }
};
