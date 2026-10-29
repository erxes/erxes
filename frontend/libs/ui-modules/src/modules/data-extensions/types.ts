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
  fieldCount: number;
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
