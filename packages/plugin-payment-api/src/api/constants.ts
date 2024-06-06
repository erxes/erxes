export const PAYMENTS = {
  qpay: {
    title: 'Qpay',
    kind: 'qpay',
    apiUrl: 'https://merchant.qpay.mn/v2',
    actions: {
      getToken: 'auth/token',
      invoice: 'invoice',
    },
    handlerMethod: 'GET',
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
      invoice: 'invoice',
      cities: 'aimaghot',
      districts: 'sumduureg',
    },
  },
  socialpay: {
    title: 'Social Pay',
    kind: 'socialpay',
    apiUrl: 'https://instore.golomtbank.com',
    actions: {
      invoicePhone: 'pos/invoice/phone',
      invoiceQr: 'pos/invoice/qr/deeplink',
      invoiceCheck: 'pos/invoice/check',
      invoiceCancel: 'pos/invoice/cancel',
    },
    handlerMethod: 'POST',
  },
  monpay: {
    title: 'MonPay',
    kind: 'monpay',
    apiUrl: 'https://wallet.monpay.mn',
    actions: {
      invoiceQr: 'rest/branch/qrpurchase/generate',
      invoiceCheck: 'rest/branch/qrpurchase/check',
      couponScan: 'rest/branch/coupon/scan',
      branchLogin: 'rest/branch/login',
    },
    handlerMethod: 'GET',
  },
  storepay: {
    title: 'storepay',
    kind: 'storepay',
    apiUrl: 'http://service-merchant.storepay.mn:7005',
    actions: {
      invoice: 'invoice',
    },
    handlerMethod: 'GET',
  },
  pocket: {
    title: 'pocket',
    kind: 'pocket',
    apiUrl: 'https://service.invescore.mn/merchant',
    actions: {
      invoice: 'invoice',
      checkInvoice: 'invoice/check',
      webhook: 'pg/config',
      cancel: 'payment-gateway/transaction/cancel',
    },
    handlerMethod: 'GET',
  },
  wechatpay: {
    title: 'WeChat Pay',
    kind: 'wechatpay',
    apiUrl: 'https://sandbox-wechat.qpay.mn/v2',
    actions: {
      getToken: 'auth/token',
      invoice: 'invoice',
      getPayment: 'payment',
    },
    handlerMethod: 'POST',
  },
  paypal: {
    kind: 'paypal',
    apiUrl: 'https://api-m.sandbox.paypal.com',
    actions: {
      getToken: 'v1/oauth2/token',
      draftInvoice: 'v2/invoicing/invoices',
    },
    handlerMethod: 'POST',
  },

  ALL: [
    'qpay',
    'socialpay',
    'monpay',
    'storepay',
    'pocket',
    'wechatpay',
    'paypal',
    'qpayQuickqr',
  ],
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',

  ALL: ['paid', 'pending', 'refunded', 'failed', 'cancelled', 'rejected'],
};

export const PLUGIN_RESOLVERS_META = {
  'inbox:conversations': {
    action: 'getConversation',
    queryKey: 'conversationId',
  },
  'cards:deals': { action: 'deals.findOne', queryKey: '_id' },
};

export const CITIES = [
  {
    code: '11000',
    name: 'Улаанбаатар',
  },
  {
    code: '21000',
    name: 'Дорнод аймаг',
  },
  {
    code: '22000',
    name: 'Сүхбаатар аймаг',
  },
  {
    code: '23000',
    name: 'Хэнтий аймаг',
  },
  {
    code: '41000',
    name: 'Төв аймаг',
  },
  {
    code: '42000',
    name: 'Говьсүмбэр аймаг',
  },
  {
    code: '43000',
    name: 'Сэлэнгэ аймаг',
  },
  {
    code: '44000',
    name: 'Дорноговь аймаг',
  },
  {
    code: '45000',
    name: 'Дархан-уул аймаг',
  },
  {
    code: '46000',
    name: 'Өмнөговь аймаг',
  },
  {
    code: '48000',
    name: 'Дундговь аймаг',
  },
  {
    code: '61000',
    name: 'Орхон аймаг',
  },
  {
    code: '62000',
    name: 'Өвөрхангай аймаг',
  },
  {
    code: '63000',
    name: 'Булган аймаг',
  },
  {
    code: '64000',
    name: 'Баянхонгор аймаг',
  },
  {
    code: '65000',
    name: 'Архангай аймаг',
  },
  {
    code: '67000',
    name: 'Хөвсгөл аймаг',
  },
  {
    code: '81000',
    name: 'Завхан аймаг',
  },
  {
    code: '82000',
    name: 'Говь-алтай аймаг',
  },
  {
    code: '83000',
    name: 'Баянөлгий аймаг',
  },
  {
    code: '84000',
    name: 'Ховд аймаг',
  },
  {
    code: '85000',
    name: 'Увс аймаг',
  }
];
