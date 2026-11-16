import { PAYMENT_GATEWAYS, PaymentGatewayKind } from '@erxes/core-contract';
import {
  type Icon,
  IconBrandPaypal,
  IconBrandStripe,
  IconBrandWechat,
  IconBuildingBank,
  IconCreditCard,
  IconQrcode,
  IconReceiptTax,
  IconWallet,
} from '@tabler/icons-react';
import { GATEWAY_NAMES } from '../payments/gatewayCatalog';

/** What an integration is for: the catalog's filters, in this order. */
export const INTEGRATION_CATEGORIES = ['payments', 'tax'] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];

/** The gateways the catalog lists: all but the development one. */
type ListedGateway = Exclude<PaymentGatewayKind, 'test'>;

interface Base {
  key: string;
  name: string;
  icon: Icon;
  category: IntegrationCategory;
  /** The countries it serves; empty: any. Others list it under other regions. */
  countries: readonly string[];
}

/**
 * The outside services core connects to for an organisation. A new one adds
 * an entry here and, for a new kind, its page in `IntegrationPage`. A gateway's
 * line is how its payers pay (Settings › Payments' `pays-*` strings).
 */
export type Integration =
  | (Base & {
      kind: 'ebarimt';
      /** One line on its tile, translated as `catalog.<key>`. */
      summary: string;
    })
  | (Base & { kind: 'gateway'; gateway: ListedGateway });

const GATEWAY_ICONS: Record<ListedGateway, Icon> = {
  qpay: IconQrcode,
  socialpay: IconWallet,
  monpay: IconWallet,
  storepay: IconCreditCard,
  pocket: IconWallet,
  toki: IconWallet,
  golomt: IconBuildingBank,
  tdb: IconBuildingBank,
  hipay: IconWallet,
  stripe: IconBrandStripe,
  paypal: IconBrandPaypal,
  wechatpay: IconBrandWechat,
};

const isListed = (kind: PaymentGatewayKind): kind is ListedGateway => kind !== 'test';

export const INTEGRATIONS: Integration[] = [
  {
    kind: 'ebarimt',
    key: 'ebarimt',
    name: 'eBarimt',
    icon: IconReceiptTax,
    category: 'tax',
    countries: ['MN'],
    summary: 'Mongolian tax receipts for paid invoices, sent through your PosAPI.',
  },
  ...PaymentGatewayKind.options.filter(isListed).map((gateway): Integration => ({
    kind: 'gateway',
    key: gateway,
    gateway,
    name: GATEWAY_NAMES[gateway],
    icon: GATEWAY_ICONS[gateway],
    category: 'payments',
    countries: PAYMENT_GATEWAYS[gateway].countries,
  })),
];

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
