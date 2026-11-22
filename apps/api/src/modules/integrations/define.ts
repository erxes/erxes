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
import type {
  ClientOptions,
  CreatedInvoice,
  CreateInvoiceInput,
  GatewayInvoice,
  PaymentCheck,
  RefundInput,
} from './gateways/types';

type FormField = Pick<IntegrationField, 'label' | 'type'>;

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

export interface KeyedIntegration<K extends Keys = Keys, C = unknown> extends Listing {
  keys: K;
  client(keys: z.output<K>, options: ClientOptions): C;
  verify(client: C): Promise<void>;
  payments?: Payments<C>;
  /** Its own actions; the `payments` ability brings the invoice actions to every gateway. */
  actions?: KeyedAction<C>[];
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
}

export type Integration = KeyedIntegration | PagedIntegration;

const fieldOf = (key: string, schema: z.ZodType): IntegrationField => {
  const meta = formFields.get(schema);

  if (!meta) throw new Error(`The integration field ${key} has no label: use field() or secret()`);

  return { key, ...meta, optional: schema.safeParse(undefined).success };
};

export const fieldsOf = (keys: Keys) =>
  Object.entries<z.ZodType>(keys.shape).map(([key, schema]) => fieldOf(key, schema));

export function defineIntegration<K extends Keys, C>(
  definition: KeyedIntegration<K, C>,
): KeyedIntegration<K, C>;
export function defineIntegration(definition: PagedIntegration): PagedIntegration;
export function defineIntegration(definition: Integration) {
  if (definition.keys) fieldsOf(definition.keys);

  return definition;
}
