export const PAYMENTCONFIGS = [
  {
    name: 'QPay',
    description: 'QPay payment method',
    isAvailable: true,
    kind: 'qpay',
    logo: 'images/payments/qpay.png',
    createModal: 'qpay',
    createUrl: '/settings/payments/createQpay',
    category: 'Payment method'
  },
  {
    name: 'SocialPay',
    description: 'SocialPay payment method',
    isAvailable: true,
    kind: 'socialpay',
    logo: 'images/payments/socialpay.png',
    createModal: 'socialpay',
    createUrl: '/settings/payments/createSocialPay',
    category: 'Payment method'
  },
  {
    name: 'MonPay',
    description: 'MonPay payment method',
    isAvailable: true,
    kind: 'monpay',
    logo: 'images/payments/monpay.png',
    createModal: 'monPay',
    createUrl: '/settings/payments/createMonPay',
    category: 'Payment method'
  },
  {
    name: 'Storepay',
    description: 'Storepay payment method',
    isAvailable: true,
    kind: 'storepay',
    logo: 'images/payments/storepay.png',
    createModal: 'storepay',
    createUrl: '/settings/payments/createStorePay',
    category: 'Payment method'
  },
  {
    name: 'Qpay Wechat Pay',
    description: 'Receive payments in Mongolia through the WeChat Pay',
    isAvailable: false,
    kind: 'wechatpay',
    logo: 'images/payments/wechatpay.png',
    createModal: 'wechatpay',
    createUrl: '/settings/payments/createWechatpay',
    category: 'Payment method'
  },
  {
    name: 'Paypal',
    description: 'Paypal payment method',
    isAvailable: false,
    kind: 'paypal',
    logo: 'images/payments/paypal.png',
    createModal: 'paypal',
    createUrl: '/settings/payments/createPaypal',
    category: 'Payment method'
  }
];

export const PAYMENT_KINDS = {
  QPAY: 'qpay',
  SOCIALPAY: 'socialpay',
  MONPAY: 'monpay',
  STOREPAY: 'storepay',
  WECHATPAY: 'wechatpay',
  PAYPAL: 'paypal',

  ALL: ['qpay', 'socialpay', 'monpay', 'storepay', 'wechatpay', 'paypal']
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  FAILED: 'failed',

  ALL: ['paid', 'pending', 'refunded', 'failed']
};
