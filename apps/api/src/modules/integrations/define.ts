import type {
  CorePermission,
  Integration as IntegrationListing,
  IntegrationField,
  IntegrationStatus,
} from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import type { GATEWAY_REFUND_KINDS } from '@erxes/core-db/enums';
import { z } from 'zod';
import type { DriverOptions, GatewayDriver } from './gateways/types';

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

interface GatewayPayments<K> {
  currencies: string[];
  refunds: (typeof GATEWAY_REFUND_KINDS)[number];
  pays: string;
  driver(keys: K, options: DriverOptions): GatewayDriver;
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

export interface KeyedIntegration<K extends Keys = Keys> extends Connection {
  keys: K;
  verify(keys: z.output<K>, options: DriverOptions): Promise<void>;
  payments?: GatewayPayments<z.output<K>>;
  status?: never;
}

export interface PagedIntegration extends Connection {
  status(tx: Db): Promise<IntegrationStatus>;
  keys?: never;
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

export function defineIntegration<K extends Keys>(
  definition: KeyedIntegration<K>,
): KeyedIntegration<K>;
export function defineIntegration(definition: PagedIntegration): PagedIntegration;
export function defineIntegration(definition: Integration) {
  if (definition.keys) fieldsOf(definition.keys);

  return definition;
}
