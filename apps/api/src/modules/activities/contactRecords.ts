import type { ContentType } from '@erxes/core-db';
import { type Changes, diffCustomFields, diffFields, mergeChanges } from '~/lib/changes';

/** A customer or company row: its columns by name. */
export interface ContactRecord {
  id: string;
  ownerId: string | null;
  [column: string]: unknown;
}

/** A customer or company as read with its tags and custom field values. */
export interface ContactRow extends ContactRecord {
  tagIds: string[];
  customFields: Record<string, unknown>;
}

const CUSTOMER_FIELDS = [
  'state',
  'firstName',
  'middleName',
  'lastName',
  'avatarUrl',
  'primaryEmail',
  'emails',
  'primaryPhone',
  'phones',
  'sex',
  'birthDate',
  'position',
  'department',
  'code',
  'description',
  'ownerId',
];

const COMPANY_FIELDS = [
  'primaryName',
  'names',
  'avatarUrl',
  'primaryEmail',
  'emails',
  'primaryPhone',
  'phones',
  'website',
  'industry',
  'size',
  'businessType',
  'code',
  'description',
  'ownerId',
];

const text = (value: unknown) => (typeof value === 'string' && value ? value : null);

/** A readable name for a record, kept in the audit log as it was. */
export const contactLabel = (type: ContentType, row: ContactRecord): string => {
  if (type === 'company') return text(row.primaryName) ?? text(row.primaryEmail) ?? row.id;

  const name = [row.firstName, row.middleName, row.lastName].map(text).filter(Boolean).join(' ');

  return name || text(row.primaryEmail) || text(row.primaryPhone) || row.id;
};

export const detailLink = (type: ContentType, id: string) =>
  `/contacts/${type === 'customer' ? 'customers' : 'companies'}/${encodeURIComponent(id)}`;

/** Field, custom field and tag changes between two versions of a record. */
export const contactChanges = (
  type: ContentType,
  before: ContactRow,
  after: ContactRow,
): Changes | null =>
  mergeChanges(
    diffFields(before, after, type === 'customer' ? CUSTOMER_FIELDS : COMPANY_FIELDS),
    diffCustomFields(before.customFields, after.customFields),
    diffFields(before, after, ['tagIds']),
  );
