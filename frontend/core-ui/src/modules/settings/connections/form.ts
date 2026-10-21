import { z } from 'zod';
import {
  CredentialInput,
  CredentialMetadata,
  CredentialTemplate,
} from './types';

const metadataText = (max: number) =>
  z
    .string()
    .max(max)
    .refine(
      (value) =>
        [...value].every(
          (character) =>
            character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127,
        ),
      'Use text without control characters',
    )
    .transform((value) => value.trim());

const fieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Enter a key')
    .max(64)
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      'Use letters, numbers, hyphens and underscores; start with a letter',
    )
    .refine(
      (key) => !['constructor', 'prototype', '__proto__'].includes(key),
      'This key is reserved',
    ),
  label: metadataText(100),
  type: z.enum(['text', 'password', 'number', 'url', 'boolean']),
  secret: z.boolean(),
  required: z.boolean(),
  hasValue: z.boolean(),
  existing: z.boolean(),
  action: z.enum(['keep', 'replace', 'clear']),
  value: z
    .string()
    .max(16384)
    .refine((value) => !value.includes('\u0000'), 'Remove null characters'),
});

export const credentialFormSchema = z
  .object({
    name: metadataText(120).pipe(z.string().min(1, 'Enter a name')),
    description: metadataText(1000),
    templateId: z.string().min(1, 'Choose a provider'),
    category: metadataText(64).pipe(z.string().min(1, 'Enter a category')),
    fields: z.array(fieldSchema).min(1, 'Add at least one field').max(32),
  })
  .superRefine(({ fields, templateId }, ctx) => {
    const keys = new Set<string>();
    fields.forEach((field, index) => {
      const issue = (message: string, property = 'value') =>
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fields', index, property],
          message,
        });
      if (keys.has(field.key)) issue('Keys must be unique', 'key');
      keys.add(field.key);
      if (field.action === 'keep' && !field.existing)
        issue('New fields need a value', 'action');
      if (
        field.required &&
        (field.action === 'clear' ||
          (field.action === 'keep' && !field.hasValue))
      )
        issue('This field is required', 'action');
      if (field.action !== 'replace') return;
      if (!field.value.trim()) issue('Enter a value');
      if (
        field.type === 'number' &&
        (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(field.value) ||
          !Number.isFinite(Number(field.value)))
      )
        issue('Enter a valid number');
      if (field.type === 'boolean' && !['true', 'false'].includes(field.value))
        issue('Choose true or false');
      if (templateId === 'smtp' && field.key === 'port') {
        const port = Number(field.value);
        if (!Number.isInteger(port) || port < 1 || port > 65535)
          issue('Use a whole number between 1 and 65535');
      }
      if (field.type === 'url') {
        try {
          const url = new URL(field.value);
          if (
            !['http:', 'https:'].includes(url.protocol) ||
            url.username ||
            url.password
          )
            issue('Enter an HTTP(S) URL without embedded credentials');
        } catch {
          issue('Enter a valid URL');
        }
      }
    });
  });

export type CredentialFormValues = z.infer<typeof credentialFormSchema>;

export const newCustomField = (): CredentialFormValues['fields'][number] => ({
  key: '',
  label: '',
  type: 'password',
  secret: true,
  required: false,
  hasValue: false,
  existing: false,
  action: 'replace',
  value: '',
});

export const credentialValueAction = (
  field: Pick<CredentialFormValues['fields'][number], 'existing' | 'required'>,
  value: string,
): CredentialFormValues['fields'][number]['action'] =>
  value !== ''
    ? 'replace'
    : field.existing
    ? 'keep'
    : field.required
    ? 'replace'
    : 'clear';

export const credentialDefaults = (
  template?: CredentialTemplate,
  credential?: CredentialMetadata,
): CredentialFormValues => ({
  name: credential?.name || '',
  description: credential?.description || '',
  templateId: credential?.templateId || template?.id || '',
  category: credential?.category || template?.category || '',
  fields: (credential?.fields || template?.fields || []).map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    secret: field.secret,
    required: field.required,
    hasValue: field.hasValue === true,
    existing: !!credential,
    action: credential ? 'keep' : field.required ? 'replace' : 'clear',
    value: '',
  })),
});

export const credentialInput = (
  values: CredentialFormValues,
): CredentialInput => ({
  name: values.name,
  description: values.description,
  templateId: values.templateId,
  category: values.category,
  fields: values.fields.map(({ key, label, type, secret, action, value }) => ({
    key,
    label: label || key,
    type,
    secret,
    action,
    ...(action === 'replace' ? { value } : {}),
  })),
});

export const credentialGrantSchema = z.object({
  pluginName: z
    .string()
    .trim()
    .min(1, 'Enter a plugin name')
    .max(64)
    .regex(
      /^[a-z][a-z0-9-]{0,63}$/,
      'Start with a lowercase letter; use lowercase letters, numbers and hyphens',
    ),
  name: metadataText(120).pipe(z.string().min(1, 'Enter a grant name')),
});

export type CredentialGrantValues = z.infer<typeof credentialGrantSchema>;
