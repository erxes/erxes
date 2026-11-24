import type { CorePermission, Integration as IntegrationListing } from '@erxes/core-contract';
import type { z } from 'zod';
import type { AppAction, AppClient, AppRecords, Apps } from './apps';
import { fieldsOf, type Keys, oauthKeys } from './fields';
import type { PhoneReply, SmsSending, SocialSignIn } from './signIn';
import type {
  ClientOptions,
  CreatedInvoice,
  CreateInvoiceInput,
  GatewayInvoice,
  PaymentCheck,
  RefundInput,
} from './types';

interface Payments<C> {
  currencies: string[];
  refunds: NonNullable<IntegrationListing['payments']>['refunds'];
  pays: string;
  createInvoice(client: C, input: CreateInvoiceInput): Promise<CreatedInvoice>;
  /**
   * What the gateway's callback brings that `check` needs (Toki's mini
   * program: its payment and the payer's token), or null when it brings
   * nothing for this invoice. Kept in the invoice's state; never trusted
   * alone, as `check` still asks the gateway.
   */
  callback?(
    body: unknown,
    invoice: { invoiceId: string; amount: number },
  ): Record<string, unknown> | null;
  check(client: C, invoice: GatewayInvoice): Promise<PaymentCheck>;
  cancel(client: C, invoice: GatewayInvoice): Promise<void>;
  refund(client: C, refund: RefundInput): Promise<{ refundId: string | null }>;
}

export interface Listing {
  key: string;
  name: string;
  summary: string;
  category: IntegrationListing['category'];
  countries: string[];
  permission: CorePermission;
  dashboard?: string;
}

export interface OAuthSetup {
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  scopeSeparator?: string;
  authorizeParams?: Record<string, string>;
  /**
   * False when the service drops PKCE's challenge from its sign-in and then refuses the
   * verifier (Meta's business apps). The signed state and the app's secret still guard the code.
   */
  pkce?: false;
  account(accessToken: string): Promise<string>;
  longLived?(
    input: { accessToken: string } & AppClient,
  ): Promise<{ accessToken: string; expiresIn?: number }>;
}

export interface KeyedIntegration<
  K extends Keys = Keys,
  C = unknown,
  O extends ClientOptions = ClientOptions,
>
  extends Listing, Apps<z.output<K>> {
  keys: K;
  /**
   * The bank integration whose connection (`keys.connectionId`) this one reads
   * through: core opens its keys and passes them as `options.bank`.
   */
  readsThrough?: string;
  client(keys: z.output<K>, options: O): C;
  verify(client: C): Promise<void>;
  /**
   * Sets the account up at the service on connecting or changing its keys
   * (QuickQR: signs the merchant up), returning keys to keep with the rest.
   * Runs after `verify`.
   */
  register?(client: C): Promise<Record<string, string>>;
  payments?: Payments<C>;
  /** Signs portals' customers in with the service's accounts (Google, Apple, Facebook). */
  socialSignIn?: SocialSignIn<C>;
  /** Proves portals' customers' phones by a text they send (verify.mn). */
  phoneReply?: PhoneReply<C>;
  /** Sends the organisation's text messages (CallPro, Twilio). */
  smsSending?: SmsSending<C>;
  /** Its own actions; the `payments` ability brings the invoice actions to every gateway. */
  actions?: AppAction<C>[];
  /**
   * The records its `plugin_record` inputs and record trigger settings pick from, by
   * `recordType`. A type it leaves out is picked only from the run's values.
   */
  records?: AppRecords<C>;
  oauth?: OAuthSetup;
  status?: never;
}

export const defineIntegration = <K extends Keys, C, O extends ClientOptions = ClientOptions>(
  definition: KeyedIntegration<K, C, O>,
) => {
  const keys: Keys = definition.keys;

  if (definition.oauth && keys !== oauthKeys)
    throw new Error(`${definition.key} signs in with OAuth: its keys are oauthKeys`);

  if (definition.hooks?.appWide && !definition.oauth)
    throw new Error(`${definition.key} hears its app's events: it signs in with OAuth`);

  fieldsOf(keys);

  return definition;
};
