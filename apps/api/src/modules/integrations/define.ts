import type {
  ActionField,
  CorePermission,
  Integration as IntegrationListing,
  IntegrationField,
  IntegrationStatus,
} from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import type { GATEWAY_REFUND_KINDS } from '@erxes/core-db/enums';
import { z } from 'zod';
import type { ActionContext, ActionSpec, CallContext } from '~/modules/automations/actions/context';
import type { AppClient, Apps } from './appDefinition';
import type {
  ClientOptions,
  CreatedInvoice,
  CreateInvoiceInput,
  GatewayInvoice,
  PaymentCheck,
  RefundInput,
} from './gateways/types';

type FormField = Pick<IntegrationField, 'label' | 'type' | 'options'>;

const formFields = z.registry<FormField>();

const labelled = <S extends z.ZodType>(schema: S, meta: FormField) => {
  formFields.add(schema, meta);

  return schema;
};

export const field = (
  label: string,
  schema: z.ZodType<string> = z.string().trim().min(1).max(200),
) => labelled(schema, { label, type: 'text' });

export const secret = (
  label: string,
  schema: z.ZodType<string> = z.string().trim().min(1).max(2000),
) => labelled(schema, { label, type: 'secret' });

/** One of a few values, picked from a list. */
export const choice = <const T extends readonly [string, ...string[]]>(label: string, options: T) =>
  labelled(z.enum(options), { label, type: 'select', options: [...options] });

/** Kept with the keys but filled by core (`register`), never asked for. */
export const kept = (label: string) =>
  labelled(z.string().trim().min(1).max(200).optional(), { label, type: 'hidden' });

export const toggle = (label: string) =>
  labelled(z.boolean().default(false), { label, type: 'switch' });

export const digits = () => z.string().trim().regex(/^\d+$/, 'a number');

export const httpsUrl = () =>
  z
    .url({ protocol: /^https$/ })
    .trim()
    .max(300);

export type Keys = z.ZodObject;

/** The step's `connection` input: one of the integration's active connections, else the default. */
export const CONNECTION_FIELD: ActionField = {
  key: 'connection',
  label: 'Connection',
  type: 'connection',
  required: false,
  description: 'Empty: the default one',
};

/** One of the integration's connections, with its client open. */
interface Connected<C> {
  id: string;
  name: string;
  client: C;
}

/** What a keyed integration's action gets: the step, its integration, and a connection to run on. */
export interface IntegrationCall<C> extends CallContext {
  integration: { key: string; name: string };
  /**
   * The connection the step's `connection` input names, else the organisation's default
   * gateway when it is one of the integration's, else its oldest active one. 409 NOT_CONNECTED.
   */
  connection(): Promise<Connected<C>>;
}

/**
 * An action a keyed integration brings to automations (`<integration>.<key>`). It reaches the
 * service outside any transaction and may run more than once: it sends `idempotencyKey(ctx)`.
 */
export type KeyedAction<C> = ActionSpec & {
  key: string;
  call(ctx: IntegrationCall<C>): Promise<unknown>;
};

/** An action of an integration with its own page: a core action, keyed within the integration. */
export type PagedAction = ActionSpec & { key: string } & (
    | { run(ctx: ActionContext): Promise<unknown> }
    | { call(ctx: CallContext): Promise<unknown> }
  );

interface Payments<C> {
  currencies: string[];
  refunds: (typeof GATEWAY_REFUND_KINDS)[number];
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

interface Listing {
  key: string;
  name: string;
  summary: string;
  category: IntegrationListing['category'];
  countries: string[];
  permission: CorePermission;
  dashboard?: string;
}

export const oauthKeys = z.object({
  accessToken: secret('Access token', z.string().min(1).max(4000)),
  refreshToken: secret('Refresh token', z.string().min(1).max(4000)).optional(),
  expiresAt: labelled(z.int().positive(), { label: 'Sign-in expires', type: 'secret' }).optional(),
  account: field('Account').optional(),
});

export type OAuthKeys = z.output<typeof oauthKeys>;

export interface OAuthSetup {
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  scopeSeparator?: string;
  authorizeParams?: Record<string, string>;
  account(accessToken: string): Promise<string>;
  longLived?(
    input: { accessToken: string } & AppClient,
  ): Promise<{ accessToken: string; expiresIn?: number }>;
}

export interface KeyedIntegration<K extends Keys = Keys, C = unknown>
  extends Listing, Apps<z.output<K>> {
  keys: K;
  /**
   * The bank integration whose connection (`keys.connectionId`) this one reads
   * through: core opens its keys and passes them as `options.bank`.
   */
  readsThrough?: string;
  client(keys: z.output<K>, options: ClientOptions): C;
  verify(client: C): Promise<void>;
  /**
   * Sets the account up at the service on connecting or changing its keys
   * (QuickQR: signs the merchant up), returning keys to keep with the rest.
   * Runs after `verify`.
   */
  register?(client: C): Promise<Record<string, string>>;
  payments?: Payments<C>;
  /** Its own actions; the `payments` ability brings the invoice actions to every gateway. */
  actions?: KeyedAction<C>[];
  oauth?: OAuthSetup;
  status?: never;
}

export interface PagedIntegration extends Listing {
  status(tx: Db): Promise<IntegrationStatus>;
  /** Listed in automations while `status` is connected or needs attention. */
  actions?: PagedAction[];
  keys?: never;
  client?: never;
  verify?: never;
  payments?: never;
  oauth?: never;
  hooks?: never;
  triggers?: never;
}

export type Integration = KeyedIntegration | PagedIntegration;

/** The label given with `field()` or `secret()`, also through `.optional()` and `.default()`. */
const metaOf = (schema: z.core.$ZodType): FormField | undefined =>
  formFields.get(schema) ??
  (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault
    ? metaOf(schema.unwrap())
    : undefined);

const fieldOf = (key: string, schema: z.ZodType): IntegrationField => {
  const meta = metaOf(schema);

  if (!meta) throw new Error(`The integration field ${key} has no label: use field() or secret()`);

  return { key, ...meta, optional: schema.safeParse(undefined).success };
};

export const fieldsOf = (keys: Keys) =>
  Object.entries<z.ZodType>(keys.shape).map(([key, schema]) => fieldOf(key, schema));

const Values = z.record(z.string(), z.unknown());

export const sealedValues = (opened: string) => Values.parse(JSON.parse(opened));

export const splitValues = (keys: Keys, values: Record<string, unknown>) => {
  const sealed = new Set(
    fieldsOf(keys).flatMap((item) => (item.type === 'secret' ? [item.key] : [])),
  );

  const given = Object.entries(values).filter(([, value]) => value !== undefined);

  return {
    settings: Object.fromEntries(given.filter(([key]) => !sealed.has(key))),
    secrets: Object.fromEntries(given.filter(([key]) => sealed.has(key))),
  };
};

export function defineIntegration<K extends Keys, C>(
  definition: KeyedIntegration<K, C>,
): KeyedIntegration<K, C>;
export function defineIntegration(definition: PagedIntegration): PagedIntegration;
export function defineIntegration(definition: Integration) {
  if (definition.oauth && definition.keys !== oauthKeys)
    throw new Error(`${definition.key} signs in with OAuth: its keys are oauthKeys`);

  if (definition.hooks?.appWide && !definition.oauth)
    throw new Error(`${definition.key} hears its app's events: it signs in with OAuth`);

  if (definition.keys) fieldsOf(definition.keys);

  return definition;
}
