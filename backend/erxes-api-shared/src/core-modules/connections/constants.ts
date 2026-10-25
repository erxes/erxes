import { z } from 'zod';
import {
  IConnectionTypeDefinition,
  IConnectionTypeDescriptor,
} from './types';

export const CONNECTION_FIELD_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
export const CONNECTION_TYPE_LOCAL_ID_PATTERN = /^[a-z][a-zA-Z0-9]{0,39}$/;
export const CONNECTION_TYPE_ID_PATTERN =
  /^[a-z][a-z0-9_]{0,39}:[a-z][a-zA-Z0-9]{0,39}$/;

export const CONNECTION_MAX_FIELDS = 50;
export const CONNECTION_MAX_VALUE_LENGTH = 16 * 1024;

// tRPC module (plugin side) and procedures (both sides).
export const CONNECTIONS_MODULE = 'connections';
export const CONNECTIONS_READ_ACTION = 'read';
export const CONNECTIONS_TEST_PRODUCER = 'test';

// Signature purposes; a token minted for one never verifies for the other.
export const CONNECTIONS_READ_PURPOSE = 'erxes-connections-read-v1';
export const CONNECTIONS_TEST_PURPOSE = 'erxes-connections-test-v1';
export const CONNECTIONS_TOKEN_TTL_MS = 60 * 1000;

/** Types a definition for `meta.connections.types`. */
export const defineConnectionType = <TResolved>(
  definition: IConnectionTypeDefinition<TResolved>,
) => definition;

export const toConnectionTypeId = (pluginName: string, localId: string) =>
  `${pluginName}:${localId}`;

const fieldDefinitionSchema = z
  .object({
    key: z.string().regex(CONNECTION_FIELD_KEY_PATTERN),
    label: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    placeholder: z.string().max(200).optional(),
    required: z.boolean().optional(),
    secret: z.boolean().optional(),
    inputType: z.enum(['text', 'url', 'email', 'number', 'textarea']).optional(),
    pattern: z
      .string()
      .max(500)
      .refine((pattern) => {
        try {
          new RegExp(pattern);
          return true;
        } catch {
          return false;
        }
      }, 'Invalid pattern')
      .optional(),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).max(CONNECTION_MAX_VALUE_LENGTH).optional(),
  })
  .strict();

const typeDefinitionSchema = z.object({
  id: z.string().regex(CONNECTION_TYPE_LOCAL_ID_PATTERN),
  label: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  icon: z.string().min(1).max(80),
  fields: z
    .array(fieldDefinitionSchema)
    .max(CONNECTION_MAX_FIELDS)
    .refine(
      (fields) => new Set(fields.map((field) => field.key)).size === fields.length,
      'Field keys must be unique',
    ),
  allowCustomFields: z.boolean().optional(),
});

/**
 * Validates a type definition and returns its serializable descriptor.
 * Throws on an invalid definition so a mistake fails at service start.
 */
export const describeConnectionType = (
  pluginName: string,
  definition: IConnectionTypeDefinition,
): IConnectionTypeDescriptor => {
  const parsed = typeDefinitionSchema.safeParse(definition);

  if (!parsed.success) {
    throw new Error(
      `Invalid connection type "${pluginName}:${definition?.id}": ${parsed.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('; ')}`,
    );
  }

  const { id, label, description, icon, fields, allowCustomFields } =
    parsed.data;

  return {
    id: toConnectionTypeId(pluginName, id),
    pluginName,
    label,
    description,
    icon,
    fields,
    allowCustomFields: Boolean(allowCustomFields),
    hasTest: typeof definition.test === 'function',
    hasResolve: typeof definition.resolve === 'function',
  };
};

/**
 * The built-in generic type: the user defines their own keys and marks the
 * secret ones. Core registers it; it has no test or resolver.
 */
export const CUSTOM_CONNECTION_TYPE: IConnectionTypeDefinition<never> = {
  id: 'custom',
  label: 'Custom',
  description: 'Your own keys and values. Mark the ones that are secret.',
  icon: 'IconPlug',
  fields: [],
  allowCustomFields: true,
};

export const CUSTOM_CONNECTION_TYPE_ID = toConnectionTypeId(
  'core',
  CUSTOM_CONNECTION_TYPE.id,
);

// Types that ship with the platform, keyed by full id. Their definitions live
// here so any service can run their resolvers locally.
export const BUILT_IN_CONNECTION_TYPES: Record<
  string,
  IConnectionTypeDefinition
> = {
  [CUSTOM_CONNECTION_TYPE_ID]: CUSTOM_CONNECTION_TYPE,
};
