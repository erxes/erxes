import type { IntegrationField } from '@erxes/core-contract';
import { z } from 'zod';

type FormField = Pick<IntegrationField, 'label' | 'type' | 'options' | 'recordType' | 'dependsOn'>;

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

/**
 * A trigger setting that is one of the app's records (`page`), picked from its `records` of
 * `recordType` instead of typed; with `dependsOn`, the ones under that other setting's value.
 */
export const record = (
  label: string,
  recordType: string,
  {
    schema = z.string().trim().min(1).max(200),
    dependsOn,
  }: { schema?: z.ZodType<string>; dependsOn?: string } = {},
) => labelled(schema, { label, type: 'text', recordType, ...(dependsOn && { dependsOn }) });

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

export const oauthKeys = z.object({
  accessToken: secret('Access token', z.string().min(1).max(4000)),
  refreshToken: secret('Refresh token', z.string().min(1).max(4000)).optional(),
  expiresAt: labelled(z.int().positive(), { label: 'Sign-in expires', type: 'secret' }).optional(),
  account: field('Account').optional(),
  accountId: kept('Account id'),
});

export type OAuthKeys = z.output<typeof oauthKeys>;

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
