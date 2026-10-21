import { credentialTemplates } from './templates';
import { CredentialsError } from './types';
import type {
  CredentialField, CredentialFieldInput, CredentialFieldType, CredentialInput,
  CredentialMetadata, CredentialValues,
} from './types';

const invalid = (): never => { throw new CredentialsError('CREDENTIALS_INVALID_INPUT'); };
const fieldTypes = new Set(['text', 'password', 'number', 'url', 'boolean']);
const hasKey = (values: CredentialValues, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(values, key);

export const boundedText = (value: unknown, max: number, required = true): string => {
  if (typeof value !== 'string' || value.length > max ||
      Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return invalid();
  const trimmed = value.trim();
  if (required && !trimmed) return invalid();
  return trimmed;
};

export const validFieldKey = (key: string): boolean =>
  typeof key === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(key) &&
  !['__proto__', 'constructor', 'prototype'].includes(key);

const customField = (input: CredentialFieldInput, old?: CredentialField): CredentialField => {
  const type = input.type ?? old?.type ?? 'password';
  if (!fieldTypes.has(type)) return invalid();
  return {
    key: input.key,
    label: boundedText(input.label ?? old?.label ?? input.key, 100),
    type: type as CredentialFieldType,
    secret: type === 'password' || (input.secret ?? old?.secret ?? true),
    required: false,
  };
};

const validateValue = (value: unknown, descriptor: CredentialField): string => {
  if (typeof value !== 'string' || value.length > 16384 || value.includes('\u0000')) return invalid();
  if (descriptor.required && !value.trim()) return invalid();
  if (!value) return value;
  if (descriptor.type === 'number' && (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(value) || !Number.isFinite(Number(value)))) return invalid();
  if (descriptor.type === 'boolean' && value !== 'true' && value !== 'false') return invalid();
  if (descriptor.type === 'url') {
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return invalid();
    } catch { return invalid(); }
  }
  return value;
};

export const prepareCredential = (
  input: CredentialInput,
  existing?: CredentialMetadata,
  previous: CredentialValues = {},
) => {
  if (!input || !Array.isArray(input.fields) || input.fields.length > 32) return invalid();
  const template = credentialTemplates.find((item) => item.id === input.templateId);
  if (!template || (existing && input.templateId !== existing.templateId)) return invalid();
  const name = boundedText(input.name, 120);
  const description = boundedText(input.description ?? '', 1000, false);
  const requestedCategory = boundedText(input.category, 64);
  if (template.id !== 'generic' && requestedCategory !== template.category) return invalid();
  const category = template.id === 'generic' ? requestedCategory : template.category;
  const descriptors = new Map<string, CredentialField>(
    (template.id === 'generic' ? existing?.fields ?? [] : template.fields).map((item) => [item.key, {
      key: item.key, label: item.label, type: item.type, secret: item.secret,
      required: item.required, help: item.help,
    }]),
  );
  const values: CredentialValues = Object.assign(Object.create(null), previous);
  const seen = new Set<string>();
  for (const item of input.fields) {
    if (!item || !validFieldKey(item.key) || seen.has(item.key)) return invalid();
    seen.add(item.key);
    if (template.id !== 'generic' && !descriptors.has(item.key)) return invalid();
    const descriptor = template.id === 'generic' ? customField(item, descriptors.get(item.key)) : descriptors.get(item.key);
    if (!descriptor || !['keep', 'replace', 'clear'].includes(item.action)) return invalid();
    if (item.action !== 'replace' && item.value != null) return invalid();
    if (item.action === 'keep' && !existing?.fields.some((old) => old.key === item.key)) return invalid();
    if (item.action === 'replace') values[item.key] = validateValue(item.value, descriptor);
    if (item.action === 'clear') {
      if (descriptor.required) return invalid();
      delete values[item.key];
    }
    descriptors.set(item.key, descriptor);
  }
  if (!descriptors.size || descriptors.size > 32) return invalid();
  for (const descriptor of descriptors.values()) {
    if (descriptor.required && (!hasKey(values, descriptor.key) || !values[descriptor.key].trim())) return invalid();
    if (hasKey(values, descriptor.key)) validateValue(values[descriptor.key], descriptor);
  }
  if (Buffer.byteLength(JSON.stringify(values), 'utf8') > 131072) return invalid();
  return {
    name, description, templateId: template.id, category, values,
    fields: [...descriptors.values()].map((descriptor) => ({
      ...descriptor, hasValue: hasKey(values, descriptor.key) && values[descriptor.key] !== '',
    })),
  };
};

export const credentialMetadata = (record: CredentialMetadata): CredentialMetadata => ({
  _id: record._id, reference: record.reference, name: record.name, description: record.description,
  templateId: record.templateId, category: record.category, createdAt: record.createdAt, updatedAt: record.updatedAt,
  fields: record.fields.map((field) => ({
    key: field.key, label: field.label, type: field.type, secret: field.secret,
    required: field.required, help: field.help, hasValue: field.hasValue,
  })),
});
