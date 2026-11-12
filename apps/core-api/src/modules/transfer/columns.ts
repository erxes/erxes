import type { TransferColumn, TransferRecordType } from '@erxes/core-contract';
import { type Db, fields } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';

type FieldType = (typeof fields.$inferSelect)['type'];

export interface Column extends TransferColumn {
  /** Other header names that mean this column (auto-mapping), lower case. */
  aliases: string[];
  /** Custom fields: their type, for converting cells. */
  fieldType?: FieldType;
}

const column = (key: string, label: string, extra: Partial<Column> = {}): Column => ({
  key,
  label,
  group: 'fields',
  importable: true,
  exportable: true,
  default: true,
  aliases: [],
  ...extra,
});

/**
 * Everything a customer/lead or company list can import and export, in
 * export order. `name` (customers) splits into first and last name on import;
 * `owner` is an email; `tags` and `companies` are names, `;`-separated.
 */
export const transferColumns = async (
  client: Db,
  orgId: string,
  recordType: TransferRecordType,
): Promise<Column[]> => {
  const isCompany = recordType === 'company';
  const builtIn: Column[] = isCompany
    ? [
        column('id', 'ID', { importable: true, default: false, aliases: ['_id'] }),
        column('primaryName', 'Name', {
          aliases: ['name', 'company', 'company name', 'нэр', 'байгууллага', 'компани'],
        }),
        column('names', 'Other names', { default: false, aliases: ['aliases', 'бусад нэр'] }),
        column('primaryEmail', 'Email', {
          aliases: ['email', 'e-mail', 'mail', 'имэйл', 'и-мэйл', 'цахим шуудан'],
        }),
        column('emails', 'Other emails', { default: false }),
        column('primaryPhone', 'Phone', {
          aliases: ['phone', 'mobile', 'tel', 'утас', 'утасны дугаар'],
        }),
        column('phones', 'Other phones', { default: false }),
        column('website', 'Website', { aliases: ['url', 'web', 'site', 'вэб'] }),
        column('industry', 'Industry', { aliases: ['салбар'] }),
        column('size', 'Employees', { aliases: ['size', 'employee count', 'ажилчдын тоо'] }),
        column('businessType', 'Business type', { default: false }),
        column('code', 'Code', { default: false, aliases: ['код'] }),
        column('description', 'Description', { default: false, aliases: ['notes', 'тайлбар'] }),
      ]
    : [
        column('id', 'ID', { importable: true, default: false, aliases: ['_id'] }),
        column('name', 'Full name', {
          exportable: false,
          aliases: ['full name', 'name', 'нэр', 'бүтэн нэр'],
        }),
        column('firstName', 'First name', { aliases: ['first', 'given name', 'нэр'] }),
        column('middleName', 'Middle name', { default: false }),
        column('lastName', 'Last name', { aliases: ['last', 'surname', 'family name', 'овог'] }),
        column('primaryEmail', 'Email', {
          aliases: ['email', 'e-mail', 'mail', 'имэйл', 'и-мэйл', 'цахим шуудан'],
        }),
        column('emails', 'Other emails', { default: false }),
        column('primaryPhone', 'Phone', {
          aliases: ['phone', 'mobile', 'tel', 'утас', 'утасны дугаар'],
        }),
        column('phones', 'Other phones', { default: false }),
        ...(recordType === 'customer'
          ? [
              column('state', 'State', {
                default: false,
                aliases: ['type', 'lead or customer', 'төлөв'],
              }),
            ]
          : []),
        column('birthDate', 'Birthday', {
          default: false,
          aliases: ['birth date', 'date of birth', 'dob', 'төрсөн өдөр'],
        }),
        column('position', 'Position', {
          default: false,
          aliases: ['title', 'job title', 'албан тушаал'],
        }),
        column('department', 'Department', { default: false, aliases: ['хэлтэс'] }),
        column('code', 'Code', { default: false, aliases: ['код'] }),
        column('description', 'Description', { default: false, aliases: ['notes', 'тайлбар'] }),
      ];
  const relations: Column[] = [
    column('owner', 'Owner', {
      group: 'relations',
      aliases: ['owner email', 'assignee', 'хариуцагч'],
    }),
    column('tags', 'Tags', { group: 'relations', aliases: ['tag', 'labels', 'шошго'] }),
    ...(isCompany
      ? [
          column('customerCount', 'Customers', {
            group: 'relations',
            importable: false,
            default: false,
          }),
        ]
      : [
          column('companies', 'Companies', {
            group: 'relations',
            aliases: ['company', 'organization', 'байгууллага', 'компани'],
          }),
        ]),
    column('createdAt', 'Created', { importable: false, default: false }),
    column('updatedAt', 'Updated', { importable: false, default: false }),
  ];
  const custom = await client
    .select({ id: fields.id, label: fields.label, type: fields.type, code: fields.code })
    .from(fields)
    .where(
      and(eq(fields.orgId, orgId), eq(fields.contentType, isCompany ? 'company' : 'customer')),
    );

  return [
    ...builtIn,
    ...custom.map((field) =>
      column(`customFields.${field.id}`, field.label, {
        group: 'custom',
        default: false,
        fieldType: field.type,
        aliases: field.code ? [field.code.toLowerCase()] : [],
      }),
    ),
    ...relations,
  ];
};

const normalize = (value: string) => value.toLowerCase().replace(/[\s_\-.:]+/g, '');

/**
 * Suggests a field for each header: the key, the label, then the aliases
 * (case, spaces and punctuation ignored); each field at most once.
 */
export const suggestMapping = (headers: string[], columns: Column[]): Record<string, string> => {
  const importable = columns.filter((item) => item.importable);
  const taken = new Set<string>();
  const mapping: Record<string, string> = {};

  // Exact key or label first (so "Name" for companies wins over aliases), then aliases.
  for (const pass of [(item: Column) => [item.key, item.label], (item: Column) => item.aliases]) {
    headers.forEach((header, index) => {
      if (mapping[String(index)] || !header.trim()) return;

      const wanted = normalize(header);
      const match = importable.find(
        (item) => !taken.has(item.key) && pass(item).some((name) => normalize(name) === wanted),
      );

      if (match) {
        mapping[String(index)] = match.key;
        taken.add(match.key);
      }
    });
  }

  return mapping;
};

// ─── Cells → values ─────────────────────────────────────────────────────────

export class CellError extends Error {}

/** `a; b, c` → ['a', 'b', 'c'] (also new lines). */
export const splitList = (value: string) =>
  value
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

/** YYYY-MM-DD from `2024-03-05`, `2024/3/5`, `2024.03.05`, `05.03.2024`, `05/03/2024` (day first) or an ISO time. */
export const parseDate = (value: string): string => {
  const text = value.trim();
  let match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(text);
  let [year, month, day] = match ? [match[1], match[2], match[3]] : [];

  if (!match) {
    match = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(text);
    if (match) [day, month, year] = [match[1], match[2], match[3]];
  }

  const date = match ? new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))) : null;

  if (!date || Number.isNaN(date.getTime()) || date.getUTCMonth() !== Number(month) - 1)
    throw new CellError(`“${text}” is not a date (use YYYY-MM-DD)`);

  return date.toISOString().slice(0, 10);
};

const YES = new Set(['yes', 'y', 'true', '1', 'тийм', 'үнэн', 'x', '✓']);
const NO = new Set(['no', 'n', 'false', '0', 'үгүй', 'худал']);

export const parseBoolean = (value: string) => {
  const text = value.trim().toLowerCase();

  if (YES.has(text)) return true;
  if (NO.has(text)) return false;

  throw new CellError(`“${value}” is not yes or no`);
};

export const parseNumber = (value: string) => {
  const number = Number(value.replace(/[\s,]/g, ''));

  if (!Number.isFinite(number)) throw new CellError(`“${value}” is not a number`);

  return number;
};

/** A custom field's cell as the field stores it. */
export const customValue = (type: FieldType | undefined, value: string): unknown => {
  switch (type) {
    case 'number':
      return parseNumber(value);
    case 'date':
      return parseDate(value);
    case 'boolean':
      return parseBoolean(value);
    case 'multiselect':
    case 'check':
    case 'list':
      return splitList(value);
    default:
      return value.trim();
  }
};

/** A stored custom value as one cell. */
export const customCell = (value: unknown): string | number => {
  if (Array.isArray(value)) return value.join('; ');
  if (value === true) return 'yes';
  if (value === false) return 'no';
  if (typeof value === 'number') return value;

  return value === null || value === undefined ? '' : String(value);
};
