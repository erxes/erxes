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
      acceptedCurrencies: ['MNT'],
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
      acceptedCurrencies: ['MNT'],
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
      acceptedCurrencies: ['MNT'],
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
      acceptedCurrencies: ['MNT'],
    },
    storepay: {
      title: 'storepay',
      kind: 'storepay',
      apiUrl: 'http://service-merchant.storepay.mn:7005',
      actions: {
        invoice: 'invoice',
      },
      handlerMethod: 'GET',
      acceptedCurrencies: ['MNT'],
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
      acceptedCurrencies: ['MNT'],
    },
    minupay: {
      title: 'MinuPay',
      kind: 'minupay',
      apiUrl: 'https://api.minu.mn',
      actions: {
        login: 'oncom/login',
        invoice: 'oncom/invoice',
        checkInvoice: 'oncom/checkTxn',
      },
      handlerMethod: 'POST',
      acceptedCurrencies: ['MNT'],
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
      acceptedCurrencies: ['MNT'],
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
  
    golomt: {
      title: 'Golomt E-Commerce',
      kind: 'golomt',
      apiUrl: 'https://ecommerce.golomtbank.com',
      actions: {
        invoice: 'api/invoice',
        invoiceCheck: 'api/inquiry',
      },
      handlerMethod: 'POST',
      acceptedCurrencies: ['MNT'],
    },
  
    stripe: {
      title: 'Stripe',
      kind: 'stripe',
      acceptedCurrencies: ['USD'],
    },
  
    khanbank: {
      title: 'Khan Bank',
      kind: 'khanbank',
      acceptedCurrencies: ['MNT','USD'],
    },
  
    ALL: [
      'qpay',
      'socialpay',
      'monpay',
      'storepay',
      'pocket',
      'wechatpay',
      'paypal',
      'minupay',
      'qpayQuickqr',
      'golomt',
      'stripe',
      'khanbank',
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
  
  export const CURRENCIES = [
    'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
    'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
    'BSD', 'BTC', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLF',
    'CLP', 'CNH', 'CNY', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF',
    'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP',
    'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL',
    'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK',
    'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW',
    'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD',
    'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MRU', 'MUR', 'MVR',
    'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD',
    'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON',
    'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP',
    'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'STN', 'SVC', 'SYP', 'SZL', 'THB',
    'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX',
    'USD', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU',
    'XCD', 'XDR', 'XOF', 'XPD'
  ]
  