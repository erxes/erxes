import { gatewayRegion, gatewayTakes, PaymentGatewayKind } from '@erxes/core-contract';

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
  wechatpay: 'WeChat Pay',
  test: 'Test',
};

/** How the payer pays: the line under the gateway's name (`pays-*` strings). */
export const GATEWAY_PAYS: Record<PaymentGatewayKind, string> = {
  qpay: 'bank-qr',
  socialpay: 'app-qr',
  monpay: 'app-qr',
  storepay: 'installments',
  pocket: 'app-qr',
  toki: 'app-qr',
  golomt: 'card',
  tdb: 'card',
  hipay: 'card',
  stripe: 'card-wallet',
  paypal: 'paypal',
  wechatpay: 'wechat',
  test: 'test',
};

/** Where the merchant finds the credentials, when the gateway has a self-serve dashboard. */
export const GATEWAY_DASHBOARDS: Partial<Record<PaymentGatewayKind, string>> = {
  stripe: 'https://dashboard.stripe.com/apikeys',
  paypal: 'https://developer.paypal.com/dashboard/applications',
  wechatpay: 'https://pay.weixin.qq.com',
};

export interface GatewaySection {
  /** A country code (ISO 3166), `global`, or `development` for the test gateway. */
  region: string;
  kinds: PaymentGatewayKind[];
}

const sectionOf = (kind: PaymentGatewayKind) =>
  kind === 'test' ? 'development' : gatewayRegion(kind);

/**
 * Sort key: the organisation's country, then sections with a gateway that
 * takes its currency, then the rest; development always last.
 */
const rank = ({ region, kinds }: GatewaySection, country: string | null, currency: string) =>
  region === 'development'
    ? 3
    : region === country
      ? 0
      : kinds.some((kind) => gatewayTakes(kind, currency))
        ? 1
        : 2;

/**
 * The gateway kinds grouped where they work, the organisation's country (or
 * its currency) first; within a section, the kinds that take the currency first.
 */
export const gatewaySections = (country: string | null, currency: string): GatewaySection[] => {
  const kinds = PaymentGatewayKind.options.toSorted(
    (a, b) => Number(gatewayTakes(b, currency)) - Number(gatewayTakes(a, currency)),
  );

  return [...new Set(kinds.map(sectionOf))]
    .map((region) => ({ region, kinds: kinds.filter((kind) => sectionOf(kind) === region) }))
    .toSorted((a, b) => rank(a, country, currency) - rank(b, country, currency));
};
