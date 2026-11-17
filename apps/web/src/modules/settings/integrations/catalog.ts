import { type Icon, IconCreditCard, IconMail, IconReceiptTax } from '@tabler/icons-react';
import { paths } from '~/lib/paths';

/** What an integration is for: the catalog's filters, in this order. */
export const INTEGRATION_CATEGORIES = ['email', 'payments', 'tax'] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];

interface Base {
  key: string;
  /** Translated as `name.<key>`. */
  name: string;
  /** One line on its tile, translated as `catalog.<key>`. */
  summary: string;
  icon: Icon;
  category: IntegrationCategory;
  /** The countries it serves; empty: any. Others list it under other regions. */
  countries: readonly string[];
}

/**
 * The outside services core connects to for an organisation. An integration
 * set up here has its page (`IntegrationPage`, by kind); one that has its own
 * settings page elsewhere (payment gateways on Settings › Payments) links there,
 * so each is connected in one place. A new one adds an entry here.
 */
export type Integration =
  | (Base & { kind: 'email' })
  | (Base & { kind: 'ebarimt' })
  | (Base & { kind: 'gateways'; to: string });

export const INTEGRATIONS: Integration[] = [
  {
    kind: 'email',
    key: 'email',
    name: 'Email sending',
    summary:
      'Invitations, notifications and broadcasts from your own address: SMTP, SendGrid or Amazon SES.',
    icon: IconMail,
    category: 'email',
    countries: [],
  },
  {
    kind: 'ebarimt',
    key: 'ebarimt',
    name: 'eBarimt',
    summary: 'Mongolian tax receipts for paid invoices, sent through your PosAPI.',
    icon: IconReceiptTax,
    category: 'tax',
    countries: ['MN'],
  },
  {
    kind: 'gateways',
    key: 'payment-gateways',
    name: 'Payment gateways',
    summary: 'QPay, Stripe, PayPal and more: connected on Settings › Payments.',
    icon: IconCreditCard,
    category: 'payments',
    countries: [],
    to: paths.settings.payments,
  },
];

/** Where its tile goes: its own page, or the settings page it has elsewhere. */
export const integrationPath = (integration: Integration) =>
  integration.kind === 'gateways' ? integration.to : paths.settings.integration(integration.key);

/** Serves the organisation's country, or any country. */
export const servesCountry = (integration: Integration, country: string | null) =>
  !integration.countries.length || (!!country && integration.countries.includes(country));
