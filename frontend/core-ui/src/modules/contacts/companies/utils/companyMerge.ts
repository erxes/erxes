import { FieldType } from '@/contacts/customers/components/customers-command-bar/merge/MergeMap';
import { TCompany } from '@/contacts/types/companyType';

export type MergeCompany = TCompany & {
  description?: string;
  isSubscribed?: string;
  links?: Record<string, string>;
  owner?: {
    _id: string;
    username?: string;
    email?: string;
    details?: { fullName?: string };
  } | null;
};

export type CompanyFields = Record<string, unknown> & {
  links?: Record<string, unknown>;
};

export interface MergeField {
  key: string;
  label: string;
  type: FieldType;
  /** Combine both values instead of asking the user to pick one. */
  union?: boolean;
  get: (company: MergeCompany, mergingIds: string[]) => unknown;
  apply: (fields: CompanyFields, value: unknown) => void;
  /** What makes two values the same, e.g. the owner's _id. */
  identity?: (value: unknown) => string;
}

const byId = (value: unknown) => (value as { _id?: string })?._id ?? '';

const plainField = (
  key: keyof MergeCompany & string,
  label: string,
  type: FieldType = 'string',
  union = false,
): MergeField => ({
  key,
  label,
  type,
  union,
  get: (company) => company[key],
  apply: (fields, value) => {
    (fields as Record<string, unknown>)[key] = value;
  },
});

const LINK_LABELS: Record<string, string> = {
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  linkedIn: 'LinkedIn',
  youtube: 'YouTube',
  github: 'Github',
};

const linkField = (key: string): MergeField => ({
  key: `links.${key}`,
  label: LINK_LABELS[key] ?? key,
  type: 'link',
  get: (company) => company.links?.[key],
  apply: (fields, value) => {
    fields.links = { ...(fields.links || {}), [key]: value };
  },
});

const MERGE_FIELDS: MergeField[] = [
  plainField('avatar', 'Avatar', 'avatar'),
  plainField('primaryName', 'Name'),
  plainField('code', 'Code'),
  plainField('primaryEmail', 'Primary Email'),
  plainField('emails', 'Emails', 'Array', true),
  plainField('primaryPhone', 'Primary Phone'),
  plainField('phones', 'Phones', 'Array', true),
  plainField('names', 'Names', 'Array', true),
  plainField('size', 'Size'),
  plainField('industry', 'Industries', 'Array', true),
  plainField('businessType', 'Business Type'),
  plainField('website', 'Website'),
  plainField('location', 'Headquarters country'),
  plainField('description', 'Description'),
  plainField('isSubscribed', 'Subscribed'),
  {
    key: 'owner',
    label: 'Owner',
    type: 'owner',
    get: (company) =>
      company.owner ?? (company.ownerId ? { _id: company.ownerId } : undefined),
    apply: (fields, value) => {
      fields.ownerId = byId(value);
    },
    identity: byId,
  },
  {
    key: 'parentCompany',
    label: 'Parent Company',
    type: 'company',
    get: (company, mergingIds) => {
      const parent =
        company.parentCompany ??
        (company.parentCompanyId ? { _id: company.parentCompanyId } : null);
      // Pointing the merged company at one of the companies being merged
      // would make it its own parent.
      if (!parent || mergingIds.includes(parent._id)) return undefined;
      return parent;
    },
    apply: (fields, value) => {
      fields.parentCompanyId = byId(value);
    },
    identity: byId,
  },
];

export const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0);

const unionValues = (a: unknown, b: unknown) =>
  Array.from(
    new Set([
      ...((Array.isArray(a) ? a : []) as unknown[]),
      ...((Array.isArray(b) ? b : []) as unknown[]),
    ]),
  );

export interface MergeRow {
  field: MergeField;
  values: [unknown, unknown];
  conflict: boolean;
}

export const buildMergeRows = (
  companies: [MergeCompany, MergeCompany],
): MergeRow[] => {
  const mergingIds = companies.map((company) => company._id);
  // `links` is free-form JSON, so compare whatever keys either company has.
  const linkKeys = Array.from(
    new Set(companies.flatMap((company) => Object.keys(company.links || {}))),
  );
  const fields = [...MERGE_FIELDS, ...linkKeys.map(linkField)];

  return fields.flatMap((field) => {
    const values = companies.map((company) =>
      field.get(company, mergingIds),
    ) as [unknown, unknown];

    if (values.every(isEmpty)) return [];

    const identity = field.identity ?? ((value) => JSON.stringify(value));
    const conflict =
      !field.union &&
      !values.some(isEmpty) &&
      identity(values[0]) !== identity(values[1]);

    return [{ field, values, conflict }];
  });
};

/** Which company's value wins a conflict: '0' = first, '1' = second. */
export type MergeChoice = '0' | '1';

export const DEFAULT_MERGE_CHOICE: MergeChoice = '0';

export const resolveMergeValue = (
  row: MergeRow,
  selected: MergeChoice = DEFAULT_MERGE_CHOICE,
) => {
  const [first, second] = row.values;
  if (row.field.union) return unionValues(first, second);
  if (row.conflict) return row.values[Number(selected)];
  return isEmpty(first) ? second : first;
};

export type MergeSelection = Record<string, MergeChoice>;

/** The `companyFields` payload for the companiesMerge mutation. */
export const buildCompanyMergeFields = (
  rows: MergeRow[],
  selection: MergeSelection,
): CompanyFields => {
  const fields: CompanyFields = {};
  rows.forEach((row) => {
    row.field.apply(fields, resolveMergeValue(row, selection[row.field.key]));
  });
  return fields;
};

/** A conflicting field, ready to render as a pick-one choice. */
export interface MergeConflictItem {
  key: string;
  label: string;
  type: FieldType;
  selected: MergeChoice;
  options: { choice: MergeChoice; fieldValue: unknown }[];
}

/** A field of the merged company, ready to render in the preview. */
export interface MergeResultItem {
  key: string;
  label: string;
  type: FieldType;
  value: unknown;
}

export const buildMergeConflicts = (
  rows: MergeRow[],
  selection: MergeSelection,
): MergeConflictItem[] =>
  rows
    .filter((row) => row.conflict)
    .map(({ field, values }) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      selected: selection[field.key] ?? DEFAULT_MERGE_CHOICE,
      options: [
        { choice: '0', fieldValue: values[0] },
        { choice: '1', fieldValue: values[1] },
      ],
    }));

export const buildMergeResults = (
  rows: MergeRow[],
  selection: MergeSelection,
): MergeResultItem[] =>
  rows
    .map((row) => ({
      key: row.field.key,
      label: row.field.label,
      type: row.field.type,
      value: resolveMergeValue(row, selection[row.field.key]),
    }))
    .filter((item) => !isEmpty(item.value));

export const getCompanyMergeName = (company: MergeCompany) =>
  company.primaryName || company.primaryEmail || company._id;

/** The two fetched companies in the order they were selected, or null. */
export const orderMergeCompanies = (
  list: MergeCompany[],
  companyIds: string[],
): [MergeCompany, MergeCompany] | null => {
  const ordered = companyIds
    .map((id) => list.find((company) => company._id === id))
    .filter((company): company is MergeCompany => Boolean(company));

  return ordered.length === 2 ? [ordered[0], ordered[1]] : null;
};
