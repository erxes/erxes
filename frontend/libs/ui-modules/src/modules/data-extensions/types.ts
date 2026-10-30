export const DATA_EXTENSION_FIELD_TYPES = [
  'text',
  'longText',
  'number',
  'boolean',
  'date',
  'select',
  'multiSelect',
  'email',
  'url',
  'phone',
  'relation',
  'currency',
  'dateTime',
  'rating',
  'percent',
  'address',
  'fullName',
  'links',
  'emails',
  'phones',
  'files',
  'member',
  'json',
] as const;

/** Same groups the server checks settings against. */
export const DATA_EXTENSION_UNIQUE_TYPES = [
  'text',
  'email',
  'phone',
  'url',
  'number',
] as const;
export const DATA_EXTENSION_RANGE_TYPES = ['number', 'currency', 'percent'];
export const DATA_EXTENSION_LENGTH_TYPES = ['text', 'longText'];
export const DATA_EXTENSION_DECIMAL_TYPES = ['number', 'currency', 'percent'];
export const DATA_EXTENSION_NO_DEFAULT_TYPES = [
  'relation',
  'member',
  'files',
  'json',
];

export const DATA_EXTENSION_ADDRESS_PARTS = [
  'street',
  'street2',
  'city',
  'state',
  'postalCode',
  'country',
] as const;

export const DATA_EXTENSION_OPTION_COLORS = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
] as const;

export type DataExtensionOptionColor =
  (typeof DATA_EXTENSION_OPTION_COLORS)[number];

/** Currencies offered first; any ISO 4217 code is accepted. */
export const DATA_EXTENSION_CURRENCIES = [
  'MNT',
  'USD',
  'EUR',
  'CNY',
  'RUB',
  'KRW',
  'JPY',
  'GBP',
] as const;

export const DATA_EXTENSION_RELATION_KINDS = [
  'manyToOne',
  'oneToOne',
  'manyToMany',
] as const;

export type DataExtensionRelationKind =
  (typeof DATA_EXTENSION_RELATION_KINDS)[number];

/** Kinds offered when creating; "has many" is stored as belongs-to reversed. */
export const DATA_EXTENSION_RELATION_CREATE_KINDS = [
  'manyToOne',
  'oneToMany',
  'oneToOne',
  'manyToMany',
] as const;

export type DataExtensionRelationCreateKind =
  (typeof DATA_EXTENSION_RELATION_CREATE_KINDS)[number];

export interface IDataExtensionRelation {
  targetRecordType: string;
  kind: DataExtensionRelationKind;
  side: 'source' | 'inverse';
  inverseFieldId?: string | null;
}

export type DataExtensionFieldType =
  (typeof DATA_EXTENSION_FIELD_TYPES)[number];

export type DataExtensionFieldStatus = 'active' | 'archived';

export interface IDataExtensionFieldOption {
  value: string;
  label: string;
  color?: DataExtensionOptionColor | null;
}

export interface IDataExtensionFieldSettings {
  required?: boolean;
  unique?: boolean;
  defaultValue?: DataExtensionValue;
  min?: number;
  max?: number;
  maxLength?: number;
  scale?: number;
  currency?: string;
  multiple?: boolean;
  precision?: number;
  group?: string;
  showInCreate?: boolean;
  placeholder?: string;
}

export interface IDataExtensionField {
  _id: string;
  recordType: string;
  key: string;
  label: string;
  description?: string | null;
  type: DataExtensionFieldType;
  options?: IDataExtensionFieldOption[] | null;
  relation?: IDataExtensionRelation | null;
  settings?: IDataExtensionFieldSettings | null;
  order: number;
  status: DataExtensionFieldStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDataExtensionRecordType {
  recordType: string;
  label: string;
  typeName: string;
  owner: string;
  /** erxes content types whose screens show records of this type. */
  contentTypes: string[];
  /** Root mutation fields that create a record of this type. */
  createMutations: string[];
  /** A tenant-defined object; its records are listed and created here. */
  custom?: boolean;
  icon?: string | null;
  singularLabel?: string | null;
  description?: string | null;
  fieldCount: number;
}

/** A custom object's definition, managed on the Data Extensions page. */
export interface IDataExtensionObject {
  _id: string;
  key: string;
  recordType: string;
  singularLabel: string;
  pluralLabel: string;
  description?: string | null;
  icon?: string | null;
  status: 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export const DATA_EXTENSION_OBJECT_ICONS = [
  'box',
  'file-text',
  'briefcase',
  'building',
  'home',
  'car',
  'calendar',
  'certificate',
  'clipboard',
  'coin',
  'heart',
  'map-pin',
  'package',
  'school',
  'shield',
  'star',
  'ticket',
  'tool',
  'truck',
  'users',
] as const;

export type DataExtensionObjectIcon =
  (typeof DATA_EXTENSION_OBJECT_ICONS)[number];

/** One row of a custom object's record list. */
export interface IDataExtensionListRecord {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  values: Record<string, DataExtensionValue>;
  links: Record<string, IDataExtensionLinkedRecord[]>;
}

export interface IDataExtensionCurrencyValue {
  amount: number;
  currency: string;
}

export type IDataExtensionAddressValue = Partial<
  Record<(typeof DATA_EXTENSION_ADDRESS_PARTS)[number], string>
>;

export interface IDataExtensionFullNameValue {
  firstName?: string;
  lastName?: string;
}

export interface IDataExtensionLinkValue {
  url: string;
  label?: string;
}

export interface IDataExtensionFileValue {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

export type DataExtensionValue =
  | string
  | number
  | boolean
  | string[]
  | IDataExtensionCurrencyValue
  | IDataExtensionAddressValue
  | IDataExtensionFullNameValue
  | IDataExtensionLinkValue[]
  | IDataExtensionFileValue[]
  | Record<string, unknown>
  | unknown[]
  | null;

/** A linked record as shown next to a relation: its id and a readable name. */
export interface IDataExtensionLinkedRecord {
  _id: string;
  name: string;
}

export interface IDataExtensionRecordResult {
  _id: string;
  summary: Record<string, unknown>;
  values: Record<string, DataExtensionValue>;
  /** Resolved records for each relation key, both directions. */
  links: Record<string, IDataExtensionLinkedRecord[]>;
  /**
   * Relation keys whose full link list was loaded, so they can be edited.
   * A has-many list cut off at the page size is shown but not edited here.
   */
  editableLinks: string[];
}

export const hasFieldOptions = (type: DataExtensionFieldType) =>
  type === 'select' || type === 'multiSelect';

/** Shown on create forms unless the field opted out. */
export const showsInCreate = (field: IDataExtensionField) =>
  field.settings?.showInCreate !== false;

export const isRequiredField = (field: IDataExtensionField) =>
  Boolean(field.settings?.required);

/** A relation side whose list of links can hold more than one record. */
export const isListRelation = (relation: IDataExtensionRelation) =>
  relation.kind === 'manyToMany' ||
  (relation.side === 'inverse' && relation.kind === 'manyToOne');

/** Null, blank text, empty lists and empty objects count as no value. */
export const isEmptyDataExtensionValue = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0);

/** The sidebar group a record type belongs to: its module, or `custom`. */
export const recordTypeGroup = (recordType: IDataExtensionRecordType) =>
  recordType.custom ? 'custom' : recordType.owner;

export type DataExtensionFilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'notContains'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'isEmpty'
  | 'isNotEmpty';

export interface IDataExtensionFilterCondition {
  field: string;
  operator: DataExtensionFilterOperator;
  value?: unknown;
}

export interface IDataExtensionFilter {
  match?: 'all' | 'any';
  conditions: IDataExtensionFilterCondition[];
}

export type DataExtensionViewType = 'table' | 'kanban' | 'calendar';

export interface IDataExtensionView {
  _id: string;
  recordType: string;
  name: string;
  type: DataExtensionViewType;
  filter?: IDataExtensionFilter | null;
  sortField?: string | null;
  sortDirection?: number | null;
  columns?: string[] | null;
  groupBy?: string | null;
  dateField?: string | null;
  shared: boolean;
  createdBy: string;
}

/** Operators offered per field type; mirrors the server's checks. */
export const filterOperatorsFor = (
  field: Pick<IDataExtensionField, 'type' | 'relation'>,
): DataExtensionFilterOperator[] => {
  const empty: DataExtensionFilterOperator[] = ['isEmpty', 'isNotEmpty'];

  if (field.relation) {
    return field.relation.side === 'source' ? ['eq', 'neq', ...empty] : [];
  }

  switch (field.type) {
    case 'text':
    case 'longText':
    case 'email':
    case 'url':
    case 'phone':
      return ['contains', 'notContains', 'eq', 'neq', ...empty];
    case 'number':
    case 'percent':
    case 'rating':
    case 'currency':
    case 'date':
    case 'dateTime':
      return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', ...empty];
    case 'boolean':
      return ['eq', ...empty];
    case 'select':
    case 'multiSelect':
      return ['in', 'nin', ...empty];
    case 'member':
      return ['eq', 'neq', ...empty];
    case 'address':
    case 'fullName':
    case 'links':
    case 'emails':
    case 'phones':
    case 'files':
      return ['contains', 'notContains', ...empty];
    default:
      return empty;
  }
};

/** Fields a board can use for its columns: one choice per record. */
export const isBoardField = (field: IDataExtensionField) =>
  field.type === 'select';

export const isDateField = (field: IDataExtensionField) =>
  field.type === 'date' || field.type === 'dateTime';
