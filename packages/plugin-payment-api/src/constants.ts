export const PAYMENTS = {
  qpay: {
    kind: 'qpay',
    apiUrl: 'https://merchant.qpay.mn/v2',
    actions: {
      getToken: 'auth/token',
      invoice: 'invoice'
    },
    handlerMethod: 'GET'
  },
  socialpay: {
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
    kind: 'monpay',
    apiUrl: 'https://wallet.monpay.mn',
    actions: {
      invoiceQr: 'rest/branch/qrpurchase/generate',
      invoiceCheck: 'rest/branch/qrpurchase/check'
    },
    handlerMethod: 'GET'
  },
  storepay: {
    kind: 'storepay',
    apiUrl: 'http://service-merchant.storepay.mn:7005',
    actions: {
      invoice: 'invoice'
    },
    handlerMethod: 'GET'
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

  ALL: ['qpay', 'socialpay', 'monpay', 'storepay', 'paypal']
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  FAILED: 'failed',

  ALL: ['paid', 'pending', 'refunded', 'failed']
};

export const PLUGIN_RESOLVERS_META = {
  'inbox:conversations': {
    action: 'getConversation',
    queryKey: 'conversationId'
  },
  'cards:deals': { action: 'deals.findOne', queryKey: '_id' }
};
