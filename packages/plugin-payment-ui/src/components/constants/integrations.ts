export const INTEGRATIONS = [
  {
    name: 'Qpay',
    description: 'Qpay payment method',
    inMessenger: false,
    isAvailable: true,
    kind: 'qpay',
    logo: '/images/payments/qpay.png',
    createModal: 'qpay',
    createUrl: '/settings/add-ons/createQpay',
    category: 'Payment method'
  },
  {
    name: 'Social pay',
    description: 'SocialPay payment method',
    inMessenger: false,
    isAvailable: true,
    kind: 'socialPay',
    logo: '/images/payments/socialPay.png',
    createModal: 'socialPay',
    createUrl: '/settings/add-ons/createSocialPay',
    category: 'Payment method'
  }
];
