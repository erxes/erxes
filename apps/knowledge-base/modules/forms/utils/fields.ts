import { z } from 'zod';
import type { FormAttachment, FormField, FormSubmission } from '../types';

export type FieldKind =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiSelect'
  | 'radio'
  | 'check'
  | 'file'
  | 'content'
  | 'unsupported';

const BY_TYPE: Record<string, FieldKind> = {
  html: 'content',
  textarea: 'textarea',
  description: 'textarea',
  email: 'email',
  company_primaryEmail: 'email',
  phone: 'phone',
  company_primaryPhone: 'phone',
  number: 'number',
  select: 'select',
  multiSelect: 'multiSelect',
  radio: 'radio',
  check: 'check',
  file: 'file',
  avatar: 'file',
  companyAvatar: 'file',
  objectList: 'unsupported',
  map: 'unsupported',
};

const BY_VALIDATION: Record<string, FieldKind> = {
  email: 'email',
  phone: 'phone',
  number: 'number',
};

export const fieldKind = (field: FormField): FieldKind =>
  BY_TYPE[field.type ?? ''] ?? BY_VALIDATION[field.validation ?? ''] ?? 'text';

export const isAnswerable = (field: FormField): boolean => {
  const kind = fieldKind(field);

  return kind !== 'content' && kind !== 'unsupported';
};

const MULTI: FieldKind[] = ['check', 'multiSelect'];

export const fieldOptions = (field: FormField): string[] =>
  (field.options ?? []).filter(Boolean);

export const fieldLabel = (field: FormField): string =>
  field.text?.trim() || 'Question';

export const fieldHint = (field: FormField): string =>
  (field.description?.trim() || field.content?.trim()) ?? '';

export type FormValue = string | string[] | FormAttachment[];
export type FormValues = Record<string, FormValue>;

const attachment = z.object({
  name: z.string(),
  url: z.string(),
  size: z.number(),
  type: z.string(),
});

const value = z.union([z.string(), z.array(z.string()), z.array(attachment)]);

const asText = (entry: FormValue): string =>
  typeof entry === 'string' ? entry.trim() : '';

const asList = (entry: FormValue): unknown[] =>
  Array.isArray(entry) ? entry : [];

const PHONE = /^\d{8,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const issueFor = (field: FormField, entry: FormValue): string | null => {
  const kind = fieldKind(field);
  const empty =
    MULTI.includes(kind) || kind === 'file'
      ? asList(entry).length === 0
      : !asText(entry);

  if (field.isRequired && empty) {
    return MULTI.includes(kind) || kind === 'file'
      ? 'Please choose at least one option.'
      : 'Please fill in this field.';
  }

  if (empty) {
    return null;
  }

  const text = asText(entry);

  if (kind === 'email' && !EMAIL.test(text)) {
    return 'Please enter a valid email address.';
  }

  if (kind === 'phone' && !PHONE.test(text.replace(/[\s()+-.]|ext/gi, ''))) {
    return 'The phone number must have at least 8 digits.';
  }

  if (kind === 'number' && Number.isNaN(Number(text))) {
    return 'Please enter digits only.';
  }

  return null;
};

export const formSchema = (fields: FormField[]) =>
  z.record(z.string(), value).superRefine((values, ctx) => {
    for (const field of fields.filter(isAnswerable)) {
      const issue = issueFor(field, values[field._id] ?? '');

      if (issue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field._id],
          message: issue,
        });
      }
    }
  });

export const defaultValues = (fields: FormField[]): FormValues =>
  Object.fromEntries(
    fields.filter(isAnswerable).map((field) => {
      const kind = fieldKind(field);

      return [field._id, MULTI.includes(kind) || kind === 'file' ? [] : ''];
    }),
  );

const submissionValue = (
  field: FormField,
  entry: FormValue,
): FormSubmission['value'] => {
  if (fieldKind(field) === 'file') {
    return Array.isArray(entry) ? (entry as FormAttachment[]) : [];
  }

  return Array.isArray(entry) ? entry.join(', ') : entry.trim();
};

export const toSubmissions = (
  fields: FormField[],
  values: FormValues,
): FormSubmission[] =>
  fields.filter(isAnswerable).map((field) => ({
    _id: field._id,
    type: field.type,
    validation: field.validation,
    text: field.text,
    value: submissionValue(field, values[field._id] ?? ''),
  }));

export const orderedFields = (fields: FormField[]): FormField[] =>
  [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
