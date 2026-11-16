import type { PaymentGatewayKind } from '@erxes/core-contract';

/** Each gateway's brand name, which new connections start with. */
export const GATEWAY_NAMES: Record<PaymentGatewayKind, string> = {
  qpay: 'QPay',
  socialpay: 'SocialPay',
  monpay: 'MonPay',
  storepay: 'StorePay',
  pocket: 'Pocket',
  toki: 'Toki',
  golomt: 'Golomt Bank',
  tdb: 'TDB',
  hipay: 'HiPay',
  stripe: 'Stripe',
  paypal: 'PayPal',
  test: 'Test',
};
