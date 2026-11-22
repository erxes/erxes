import type {
  CorePermission,
  DataField,
  Integration as IntegrationListing,
  IntegrationField,
  IntegrationStatus,
} from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import type { GATEWAY_REFUND_KINDS } from '@erxes/core-db/enums';
import { z } from 'zod';
import type { DriverOptions, GatewayDriver } from './gateways/types';

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

interface GatewayPayments<K> {
  currencies: string[];
  refunds: (typeof GATEWAY_REFUND_KINDS)[number];
  pays: string;
  driver(keys: K, options: DriverOptions): GatewayDriver;
}

export interface Delivery {
  method: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  raw: string;
  body: unknown;
}

export interface AppEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
}

interface Received {
  reply?: { status: number; body: unknown };
  events: AppEvent[];
}

export class DeliveryRefused extends Error {}

export interface AppHooks<C, S extends Keys = Keys> {
  scope: S;
  subscribe(input: {
    keys: C;
    scope: z.output<S>;
    url: string;
    secret: string;
    events: string[];
    externalId: string | null;
  }): Promise<{ externalId: string; secret?: string }>;
  unsubscribe(input: { keys: C; scope: z.output<S>; externalId: string }): Promise<void>;
  receive(delivery: Delivery, secret: string): Received;
}

interface TriggerInfo {
  key: string;
  label: string;
  description: string;
  outputs: DataField[];
}

export interface HookTrigger extends TriggerInfo {
  via: 'hook';
  on: string;
  when?: (payload: Record<string, unknown>) => boolean;
}

interface Polled {
  cursor: unknown;
  items: { id: string; payload: Record<string, unknown> }[];
}

interface PollTrigger<C> extends TriggerInfo {
  via: 'poll';
  params: Keys;
  everyMinutes: number;
  poll(input: { keys: C; params: unknown; cursor: unknown }): Promise<Polled>;
}

type AppTrigger<C> = HookTrigger | PollTrigger<C>;

export const pollTrigger = <C, P extends Keys>(
  definition: TriggerInfo & {
    params: P;
    everyMinutes?: number;
    poll(input: { keys: C; params: z.output<P>; cursor: unknown }): Promise<Polled>;
  },
): PollTrigger<C> => ({
  ...definition,
  via: 'poll',
  everyMinutes: definition.everyMinutes ?? 5,
  poll: (input) => definition.poll({ ...input, params: definition.params.parse(input.params) }),
});

export const hookTrigger = (definition: Omit<HookTrigger, 'via'>): HookTrigger => ({
  ...definition,
  via: 'hook',
});

interface Apps<C> {
  hooks?: AppHooks<C>;
  triggers?: AppTrigger<C>[];
}

interface Connection {
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
  expiresAt: z.int().positive().optional(),
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
}

export interface KeyedIntegration<K extends Keys = Keys> extends Connection, Apps<z.output<K>> {
  keys: K;
  /**
   * The bank integration whose connection (`keys.connectionId`) this one reads
   * through: core opens its keys and passes them as `options.bank`.
   */
  readsThrough?: string;
  verify(keys: z.output<K>, options: DriverOptions): Promise<void>;
  /**
   * Sets the account up at the service on connecting or changing its keys
   * (QuickQR: signs the merchant up), returning keys to keep with the rest.
   * Runs after `verify`.
   */
  register?(keys: z.output<K>, options: DriverOptions): Promise<Record<string, string>>;
  payments?: GatewayPayments<z.output<K>>;
  oauth?: OAuthSetup;
  status?: never;
}

export interface PagedIntegration extends Connection {
  status(tx: Db): Promise<IntegrationStatus>;
  keys?: never;
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

export function defineIntegration<K extends Keys>(
  definition: KeyedIntegration<K>,
): KeyedIntegration<K>;
export function defineIntegration(definition: PagedIntegration): PagedIntegration;
export function defineIntegration(definition: Integration) {
  if (definition.oauth && definition.keys !== oauthKeys)
    throw new Error(`${definition.key} signs in with OAuth: its keys are oauthKeys`);

  if (definition.keys) fieldsOf(definition.keys);

  return definition;
}
