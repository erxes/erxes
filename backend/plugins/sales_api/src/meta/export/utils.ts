import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export type ExportRow = Record<string, string | number>;

/** One export column as `[key, label, isDefault]`. */
export type ExportHeaderRow = [key: string, label: string, isDefault?: boolean];

/** Builds export header definitions from compact `[key, label, isDefault]` rows. */
export const toExportHeaders = (
  rows: ExportHeaderRow[],
): ImportHeaderDefinition[] =>
  rows.map(([key, label, isDefault]) => ({
    key,
    label,
    ...(isDefault ? { isDefault } : {}),
  }));

type CoreLookupModule =
  | 'users'
  | 'customers'
  | 'companies'
  | 'tags'
  | 'branches'
  | 'departments'
  | 'products';

interface ICoreUser {
  _id: string;
  email?: string;
  username?: string;
  details?: { fullName?: string; firstName?: string; lastName?: string };
}

interface ICoreCustomer {
  _id: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  code?: string;
}

interface ICoreCompany {
  _id: string;
  primaryName?: string;
  names?: string[];
  primaryEmail?: string;
  primaryPhone?: string;
  code?: string;
}

interface ICoreNamed {
  _id: string;
  name?: string;
  title?: string;
  code?: string;
}

interface ICoreProduct {
  _id: string;
  name?: string;
  code?: string;
}

/**
 * Turns any stored value into the text of one CSV cell: lists are joined
 * with `; `, dates become ISO strings, booleans Yes/No, objects JSON.
 */
export const formatExportValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatExportValue(item))
      .filter(Boolean)
      .join('; ');
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Functions and symbols carry no exportable data.
  return '';
};

/** Formats an optional date or date string as an ISO cell, empty if unset. */
export const formatExportDate = (value?: Date | string | null): string => {
  if (!value) {
    return '';
  }

  return formatExportValue(new Date(value));
};

/** Returns a finite number for amount columns, 0 when the value is missing. */
export const toExportNumber = (value?: number | null): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

/** Drops empty ids and duplicates so each core lookup asks once per id. */
export const uniqueIds = (ids: Array<string | null | undefined>): string[] => {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
};

/**
 * Loads one batch of core records by id. Export batches are bounded by the
 * worker batch size, so a single `$in` query per module is enough. A failed
 * lookup throws, so the export fails and retries instead of finishing with
 * blank names.
 */
const findCoreRecords = async <T extends { _id: string }>(
  subdomain: string,
  module: CoreLookupModule,
  ids: string[],
): Promise<T[]> => {
  if (!ids.length) {
    return [];
  }

  const records: T[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action: 'find',
    input:
      module === 'products'
        ? { query: { _id: { $in: ids } }, limit: ids.length }
        : { query: { _id: { $in: ids } } },
    defaultValue: [],
    throwOnError: true,
  });

  return Array.isArray(records) ? records : [];
};

/** Indexes records by id, keeping only the label each one exports as. */
const toMap = <T extends { _id: string }>(
  records: T[],
  label: (record: T) => string,
): Map<string, string> => {
  return new Map(records.map((record) => [String(record._id), label(record)]));
};

/** Display name of a team member: full name, else email, else username. */
export const getUserLabel = (user: ICoreUser): string => {
  const fullName =
    user.details?.fullName ||
    [user.details?.firstName, user.details?.lastName].filter(Boolean).join(' ');

  return fullName || user.email || user.username || '';
};

/** Display name of a customer: name, else email, phone or code. */
export const getCustomerLabel = (customer: ICoreCustomer): string => {
  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    fullName ||
    customer.primaryEmail ||
    customer.primaryPhone ||
    customer.code ||
    ''
  );
};

/** Display name of a company: primary name, else email, phone or code. */
export const getCompanyLabel = (company: ICoreCompany): string => {
  return (
    company.primaryName ||
    company.names?.[0] ||
    company.primaryEmail ||
    company.primaryPhone ||
    company.code ||
    ''
  );
};

/** Branch or department label as `code - title`, or just the title. */
const getStructureLabel = (record: ICoreNamed): string => {
  const title = record.title || record.name || '';
  return record.code && title ? `${record.code} - ${title}` : title;
};

/** Team member display names by id. */
export const fetchUserNames = async (subdomain: string, ids: string[]) =>
  toMap(
    await findCoreRecords<ICoreUser>(subdomain, 'users', ids),
    getUserLabel,
  );

/** Tag names by id. */
export const fetchTagNames = async (subdomain: string, ids: string[]) =>
  toMap(
    await findCoreRecords<ICoreNamed>(subdomain, 'tags', ids),
    (tag) => tag.name || '',
  );

/** Branch labels by id. */
export const fetchBranchNames = async (subdomain: string, ids: string[]) =>
  toMap(
    await findCoreRecords<ICoreNamed>(subdomain, 'branches', ids),
    getStructureLabel,
  );

/** Department labels by id. */
export const fetchDepartmentNames = async (subdomain: string, ids: string[]) =>
  toMap(
    await findCoreRecords<ICoreNamed>(subdomain, 'departments', ids),
    getStructureLabel,
  );

/** Customer records by id, for name, email and phone columns. */
export const fetchCustomers = async (subdomain: string, ids: string[]) =>
  new Map(
    (await findCoreRecords<ICoreCustomer>(subdomain, 'customers', ids)).map(
      (customer) => [String(customer._id), customer],
    ),
  );

/** Company records by id. */
export const fetchCompanies = async (subdomain: string, ids: string[]) =>
  new Map(
    (await findCoreRecords<ICoreCompany>(subdomain, 'companies', ids)).map(
      (company) => [String(company._id), company],
    ),
  );

/** Product records by id, for code and name in product summaries. */
export const fetchProducts = async (subdomain: string, ids: string[]) =>
  new Map(
    (await findCoreRecords<ICoreProduct>(subdomain, 'products', ids)).map(
      (product) => [String(product._id), product],
    ),
  );

/** Resolves ids to names and joins them into one `; `-separated cell. */
export const joinNames = (
  ids: string[] | undefined,
  names: Map<string, string>,
): string => {
  return (ids || [])
    .map((id) => names.get(String(id)) || '')
    .filter(Boolean)
    .join('; ');
};

/**
 * The module producer hands handlers the inner `data` payload, while the
 * shared handler types still describe the `{ subdomain, data }` envelope.
 * Accept both so a handler works whichever shape reaches it.
 */
export const unwrapExportPayload = <T extends object>(
  args: T | { subdomain?: string; data: T },
): T => {
  if ('data' in args && args.data && typeof args.data === 'object') {
    return args.data;
  }

  return args as T;
};

/** Keeps only the requested columns, in the order the export asked for. */
export const pickExportFields = (
  id: string,
  row: ExportRow,
  selectedFields?: string[],
): ExportRow => {
  if (!selectedFields?.length) {
    return { _id: id, ...row };
  }

  const picked: ExportRow = { _id: id };

  for (const key of selectedFields) {
    picked[key] = row[key] ?? '';
  }

  return picked;
};

