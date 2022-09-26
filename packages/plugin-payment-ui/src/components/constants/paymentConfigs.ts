export const PAYMENTCONFIGS = [
  {
    name: 'Qpay',
    description: 'Qpay payment method',
    inMessenger: false,
    isAvailable: true,
    type: 'qpay',
    logo: '/images/payments/qpay.png',
    createModal: 'qpay',
    createUrl: '/settings/payments/createQpay',
    category: 'Payment method'
  },
  {
    name: 'Social pay',
    description: 'SocialPay payment method',
    inMessenger: false,
    isAvailable: true,
    type: 'socialPay',
    logo: '/images/payments/socialPay.png',
    createModal: 'socialPay',
    createUrl: '/settings/payments/createSocialPay',
    category: 'Payment method'
  }
];
