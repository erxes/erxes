import { z } from 'zod';
import {
  IConnection,
  IConnectionFieldInput,
  IConnectionType,
} from '@/settings/connections/types';

export const CONNECTION_FIELD_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

const rowSchema = z.object({
  key: z.string(),
  label: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  secret: z.boolean(),
  // A new value. Secrets are never prefilled.
  value: z.string(),
  // A saved secret exists on the server.
  hasValue: z.boolean(),
  // The user chose to replace the saved secret.
  replace: z.boolean(),
  // A row the user added (custom types); its key and secret flag are editable.
  custom: z.boolean(),
  required: z.boolean(),
  inputType: z.enum(['text', 'url', 'email', 'number', 'textarea']).optional(),
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
});

export type TConnectionFormRow = z.infer<typeof rowSchema>;

const isUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** The message for a row that is invalid, or null. */
export const validateConnectionRow = (
  row: TConnectionFormRow,
): string | null => {
  const name = row.label || row.key || 'This field';
  const keepsSavedSecret = row.secret && row.hasValue && !row.replace;

  if (row.custom && !CONNECTION_FIELD_KEY_PATTERN.test(row.key)) {
    return 'Start with a letter; use only letters, numbers and _';
  }

  if (keepsSavedSecret) {
    return null;
  }

  // A saved secret turned plain: its value is not readable, so re-enter it.
  if (!row.secret && row.hasValue && !row.value) {
    return `Enter a new value for ${name}`;
  }

  if (!row.value) {
    return row.required ? `${name} is required` : null;
  }

  if (row.minLength && row.value.length < row.minLength) {
    return `${name} must be at least ${row.minLength} characters`;
  }

  if (row.maxLength && row.value.length > row.maxLength) {
    return `${name} can be at most ${row.maxLength} characters`;
  }

  if (row.inputType === 'url' && !isUrl(row.value)) {
    return `${name} must be a valid URL`;
  }

  if (row.inputType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.value)) {
    return `${name} must be a valid email address`;
  }

  if (row.inputType === 'number' && !Number.isFinite(Number(row.value))) {
    return `${name} must be a number`;
  }

  if (row.pattern && !new RegExp(row.pattern).test(row.value)) {
    return `${name} has an invalid format`;
  }

  return null;
};

export const connectionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(120, 'Use at most 120 characters'),
    icon: z.string().optional(),
    logo: z.string().optional(),
    type: z.string().min(1, 'Choose a type'),
    fields: z.array(rowSchema),
  })
  .superRefine((data, ctx) => {
    if (!data.icon && !data.logo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['icon'],
        message: 'Choose an icon or upload a logo',
      });
    }

    const keys = new Set<string>();

    data.fields.forEach((row, index) => {
      const message = validateConnectionRow(row);

      if (message) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fields', index, row.custom && !CONNECTION_FIELD_KEY_PATTERN.test(row.key) ? 'key' : 'value'],
          message,
        });
      }

      if (keys.has(row.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fields', index, 'key'],
          message: 'This key is already used',
        });
      }

      keys.add(row.key);
    });
  });

export type TConnectionForm = z.infer<typeof connectionFormSchema>;

export const emptyCustomRow = (): TConnectionFormRow => ({
  key: '',
  secret: false,
  value: '',
  hasValue: false,
  replace: false,
  custom: true,
  required: false,
});

/**
 * The form rows for a type: its schema fields first, then (for types that
 * allow them) the connection's own keys. Saved secrets are never prefilled.
 */
export const connectionFormRows = (
  type: IConnectionType | undefined,
  connection?: IConnection | null,
): TConnectionFormRow[] => {
  const saved = new Map(
    (connection?.fields || []).map((field) => [field.key, field]),
  );
  const schemaRows: TConnectionFormRow[] = (type?.fields || []).map(
    (field) => {
      const stored = saved.get(field.key);
      const secret = Boolean(field.secret);

      return {
        key: field.key,
        label: field.label,
        description: field.description || undefined,
        placeholder: field.placeholder || undefined,
        secret,
        value: secret ? '' : stored?.value || '',
        hasValue: Boolean(secret && stored?.hasValue),
        replace: false,
        custom: false,
        required: Boolean(field.required),
        inputType: field.inputType || undefined,
        pattern: field.pattern || undefined,
        minLength: field.minLength ?? undefined,
        maxLength: field.maxLength ?? undefined,
      };
    },
  );

  if (!type?.allowCustomFields) {
    return schemaRows;
  }

  const schemaKeys = new Set(schemaRows.map((row) => row.key));
  const customRows = (connection?.fields || [])
    .filter((field) => !schemaKeys.has(field.key))
    .map((field) => ({
      ...emptyCustomRow(),
      key: field.key,
      label: field.label || undefined,
      secret: field.secret,
      value: field.secret ? '' : field.value || '',
      hasValue: Boolean(field.secret && field.hasValue),
    }));

  return [...schemaRows, ...customRows];
};

/** The mutation input: a kept secret is sent without a value. */
export const toConnectionFieldInputs = (
  rows: TConnectionFormRow[],
): IConnectionFieldInput[] =>
  rows.map((row) => {
    const keepsSavedSecret = row.secret && row.hasValue && !row.replace;

    return {
      key: row.key.trim(),
      ...(row.custom
        ? { secret: row.secret, ...(row.label ? { label: row.label } : {}) }
        : {}),
      ...(keepsSavedSecret ? {} : { value: row.value }),
    };
  });
