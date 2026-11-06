import { z } from 'zod/v4';

/**
 * What the engine reads from a node's `config`, declared by the service that
 * runs the node. It is not the builder form's state: fields that only the form
 * needs (placeholders, editor JSON) are allowed but never required.
 */
export type TAutomationConfigSchema = z.ZodType;

export type TAutomationJsonSchema = Record<string, unknown>;

/**
 * Gives a config field the meaning an author reads in configJsonSchema. zod
 * drops metadata on any later chained call, so it is attached last.
 */
export const describeConfigField = <T extends z.ZodType>(
  schema: T,
  description: string,
) => schema.meta({ description });

/**
 * A config value a validator can look up as a record id: a variable, a
 * conditional token or a static choice is only known when the run fills it.
 */
export const readLiteralConfigId = (value: unknown): string | undefined => {
  const id = typeof value === 'string' ? value.trim() : '';

  return id && !/\{\{|<<|\[\[/.test(id) ? id : undefined;
};

/**
 * A field only the builder fills, such as credentials: it stays in the
 * published schema, but authors outside the builder are not shown it and
 * leave it for the builder.
 */
export const builderOnlyConfigField = <T extends z.ZodType>(
  schema: T,
  description: string,
) => schema.meta({ description, builderOnly: true });

/** Branch links a node keeps in its config, one per button, topic or option. */
export const automationOptionalConnectsSchema = z.array(
  z.object({
    sourceId: z.string().optional(),
    optionalConnectId: z.string().optional(),
    actionId: z.string().optional(),
  }),
);

export type TAutomationConfigIssue = {
  path: string;
  message: string;
  /**
   * The value is there but wrong: of a shape nothing can read (a number where
   * text goes, an unknown option) or pointing at nothing (a record that does
   * not exist, a segment of another record type, a step the flow lacks). Even
   * a draft is refused for it. A value still missing is not malformed.
   */
  malformed?: boolean;
  /**
   * Which check found it: the declared schema, a lookup of the tenant's
   * records (`validateConfig`), the trigger's segment, or what the config
   * refers to elsewhere in the flow.
   */
  check?: 'schema' | 'records' | 'segment' | 'references';
};

export type TAutomationConfigCheck = {
  id: string;
  type: string;
  status: 'valid' | 'invalid' | 'unchecked';
  issues?: TAutomationConfigIssue[];
};

export type TAutomationConfigCheckNode = {
  id: string;
  type: string;
  config?: unknown;
};

/**
 * Rules a schema cannot state because they need the tenant's data (a sender
 * is verified, a record exists). Runs in the declaring service, only once the
 * schema has accepted the config.
 */
export type TAutomationConfigValidator = (args: {
  subdomain: string;
  config: Record<string, unknown>;
}) => Promise<TAutomationConfigIssue[]>;

export type TAutomationConfigContract = {
  schema: TAutomationConfigSchema;
  validate?: TAutomationConfigValidator;
};

const transportCache = new WeakMap<object, TAutomationJsonSchema>();

/** A JSON copy of a schema keeps its shape but loses its methods. */
export const isAutomationConfigSchema = (
  value: unknown,
): value is TAutomationConfigSchema =>
  !!value &&
  typeof value === 'object' &&
  '_zod' in value &&
  'safeParse' in value &&
  typeof value.safeParse === 'function';

/** Input side: what a caller must send, so defaulted fields stay optional. */
export const toTransportConfigSchema = (
  schema: unknown,
): TAutomationJsonSchema | undefined => {
  if (!isAutomationConfigSchema(schema)) {
    return undefined;
  }

  const cached = transportCache.get(schema);

  if (cached) {
    return cached;
  }

  const jsonSchema: TAutomationJsonSchema = {
    ...z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }),
  };

  delete jsonSchema.$schema;
  transportCache.set(schema, jsonSchema);

  return jsonSchema;
};

const MALFORMED_CODES = ['invalid_type', 'invalid_value', 'invalid_union'];

const valueAt = (value: unknown, path: PropertyKey[]): unknown =>
  path.reduce<unknown>(
    (current, key) =>
      current && typeof current === 'object'
        ? Reflect.get(current, key)
        : undefined,
    value,
  );

export const toAutomationConfigIssues = (
  error: z.ZodError,
  config?: unknown,
): TAutomationConfigIssue[] =>
  error.issues.map(({ code, path, message }) => {
    const value = valueAt(config, path);
    const malformed =
      MALFORMED_CODES.includes(code) &&
      value !== undefined &&
      value !== null &&
      value !== '';

    return {
      path: ['config', ...path.map(String)].join('.'),
      message,
      check: 'schema' as const,
      ...(malformed && { malformed }),
    };
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const checkNodeConfig = async (
  contract: TAutomationConfigContract | undefined,
  { id, type, config }: TAutomationConfigCheckNode,
  subdomain: string,
): Promise<TAutomationConfigCheck> => {
  if (!contract) {
    return { id, type, status: 'unchecked' };
  }

  const parsed = contract.schema.safeParse(config ?? {});

  if (!parsed.success) {
    return {
      id,
      type,
      status: 'invalid',
      issues: toAutomationConfigIssues(parsed.error, config),
    };
  }

  if (!contract.validate) {
    return { id, type, status: 'valid' };
  }

  try {
    const issues = await contract.validate({
      subdomain,
      config: isRecord(parsed.data) ? parsed.data : {},
    });

    return issues.length
      ? {
          id,
          type,
          status: 'invalid',
          issues: issues.map((issue) => ({ check: 'records', ...issue })),
        }
      : { id, type, status: 'valid' };
  } catch {
    // A rule that could not read the tenant's data has not passed.
    return { id, type, status: 'unchecked' };
  }
};

export const checkAutomationNodeConfigs = (
  contracts: Record<string, TAutomationConfigContract>,
  nodes: TAutomationConfigCheckNode[],
  { subdomain }: { subdomain: string },
): Promise<TAutomationConfigCheck[]> =>
  Promise.all(
    nodes.map((node) => checkNodeConfig(contracts[node.type], node, subdomain)),
  );
