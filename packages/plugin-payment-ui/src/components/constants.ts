export const PAYMENTCONFIGS = [
  {
    name: 'Qpay',
    description: 'Qpay payment method',
    isAvailable: true,
    kind: 'qpay',
    logo: '/images/payments/qpay.png',
    createModal: 'qpay',
    createUrl: '/settings/payments/createQpay',
    category: 'Payment method'
  },
  {
    name: 'Social pay',
    description: 'SocialPay payment method',
    isAvailable: true,
    kind: 'socialPay',
    logo: '/images/payments/socialPay.png',
    createModal: 'socialPay',
    createUrl: '/settings/payments/createSocialPay',
    category: 'Payment method'
  }
];

export const PAYMENT_KINDS = {
  QPAY: 'qpay',
  SOCIALPAY: 'socialPay',

  ALL: ['qpay', 'socialPay']
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  FAILED: 'failed',

  ALL: ['paid', 'pending', 'refunded', 'failed']
};
