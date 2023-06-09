import MonpayForm from './form/MonpayForm';
import PaypalForm from './form/PaypalForm';
import QpayForm from './form/QpayForm';
import QuickQrForm from './form/QuickQrForm';
import SocialPayForm from './form/SocialPayForm';
import StorepayForm from './form/StorePayForm';

export const PAYMENTCONFIGS = [
  {
    name: 'QPay',
    description:
      'When you already have a QPay account, you can use this payment method to receive payments in Mongolia.',
    isAvailable: true,
    kind: 'qpay',
    logo: 'images/payments/qpay.png',
    createModal: QpayForm,
    createUrl: '/settings/payments/createQpay',
    category: 'Payment method',
    color: 'blue',
    link:
      'mailto:%20info@qpay.mn?subject=QPay%20Registration&body=Dear%20QPay%20Team,%0D%0A%0D%0AI%20would%20like%20to%20'
  },
  {
    name: 'QPay Quick QR',
    description:
      "If you don't have a QPay account, you can directly register for QPay here and receive payments in Mongolia using this payment method.",
    isAvailable: true,
    kind: 'qpayQuickqr',
    logo: 'images/payments/qpay.png',
    createModal: QuickQrForm,
    createUrl: '/settings/payments/createQpay',
    category: 'Payment method',
    color: 'blue',
    modalSize: 'xl'
  },
  {
    name: 'SocialPay',
    description:
      'Fast and easy way to receive money using the recipient’s mobile number.',
    isAvailable: true,
    kind: 'socialpay',
    logo: 'images/payments/socialpay.png',
    createModal: SocialPayForm,
    createUrl: '/settings/payments/createSocialPay',
    category: 'Payment method',
    color: 'blue',
    link: 'https://www.golomtbank.com/retail/digital-bank/socialpay'
  },
  {
    name: 'MonPay',
    description: 'Easy, fast and reliable payment by QR scan',
    isAvailable: true,
    kind: 'monpay',
    logo: 'images/payments/monpay.png',
    createModal: MonpayForm,
    createUrl: '/settings/payments/createMonPay',
    category: 'Payment method',
    color: 'blue',
    link:
      'mailto:%20Merchantservice@mobifinance.mn?subject=MonPay%20Merchant%20Registration&body=Dear%20MonPay%20Team,%0D%0A%0D%0AI%20would%20like%20to%20'
  },
  {
    name: 'Storepay',
    description:
      'Storepay is a service with no additional interest or fees, where you pay in installments for the goods and services you purchase.',
    isAvailable: true,
    kind: 'storepay',
    logo: 'images/payments/storepay.png',
    createModal: StorepayForm,
    createUrl: '/settings/payments/createStorePay',
    category: 'Payment method',
    color: 'blue'
  },
  {
    name: 'Qpay Wechat Pay',
    description: 'Receive payments in Mongolia through the WeChat Pay',
    isAvailable: false,
    kind: 'wechatpay',
    logo: 'images/payments/wechatpay.png',
    createModal: '',
    createUrl: '/settings/payments/createWechatpay',
    category: 'Payment method',
    color: 'green'
  },
  {
    name: 'Paypal',
    description: 'Paypal payment method',
    isAvailable: false,
    kind: 'paypal',
    logo: 'images/payments/paypal.png',
    createModal: PaypalForm,
    createUrl: '/settings/payments/createPaypal',
    category: 'Payment method',
    color: 'blue'
  }
];

export const PAYMENT_KINDS = {
  QPAY: 'qpay',
  QPAY_QUICK_QR: 'qpayQuickqr',
  SOCIALPAY: 'socialpay',
  MONPAY: 'monpay',
  STOREPAY: 'storepay',
  WECHATPAY: 'wechatpay',
  PAYPAL: 'paypal',

  ALL: [
    'qpay',
    'socialpay',
    'monpay',
    'storepay',
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

  ALL: ['paid', 'pending', 'refunded', 'failed']
};

export const BANK_CODES = [
  { value: '010000', label: 'Bank of Mongolia' },
  { value: '020000', label: 'Capital bank' },
  { value: '040000', label: 'Trade and Development bank' },
  { value: '050000', label: 'KHANBANK' },
  { value: '150000', label: 'Golomt bank' },
  { value: '190000', label: 'Trans bank' },
  { value: '210000', label: 'Arig bank' },
  { value: '220000', label: 'Credit bank' },
  //   { value: '260000', label: 'UB city bank' },
  { value: '290000', label: 'National investment bank' },
  { value: '300000', label: 'Capitron bank' },
  { value: '320000', label: 'Khas bank' },
  { value: '330000', label: 'Chingis Khaan bank' },
  { value: '340000', label: 'State bank' },
  { value: '360000', label: 'Development Bank of Mongolia ' },
  { value: '380000', label: 'Bogd bank' },
  { value: '900000', label: 'MOF (treasury fund) ' },
  { value: '940000', label: 'Security settlement clearing house' },
  { value: '950000', label: 'Central securities depository' },
  { value: '500000', label: 'MobiFinance NBFI' }
];
