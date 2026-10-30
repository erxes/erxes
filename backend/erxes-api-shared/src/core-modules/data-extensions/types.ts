import {
  DATA_EXTENSION_FIELD_STATUSES,
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_OPTION_COLORS,
  DATA_EXTENSION_RELATION_KINDS,
} from './constants';

export type DataExtensionFieldType = (typeof DATA_EXTENSION_FIELD_TYPES)[number];

export type DataExtensionFieldStatus =
  (typeof DATA_EXTENSION_FIELD_STATUSES)[keyof typeof DATA_EXTENSION_FIELD_STATUSES];

export type DataExtensionOwner = 'core' | 'operation' | 'sales' | 'frontline';

export type DataExtensionObjectStatus = 'active' | 'archived';

/** A tenant-defined object, e.g. Contracts; its records are core-owned. */
export interface IDataExtensionObject {
  key: string;
  singularLabel: string;
  pluralLabel: string;
  description?: string;
  icon?: string;
  status: DataExtensionObjectStatus;
  createdBy?: string;
  updatedBy?: string;
}

export interface IDataExtensionObjectDocument extends IDataExtensionObject {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DataExtensionNativeGraphqlType =
  | 'ID'
  | 'String'
  | 'Float'
  | 'Int'
  | 'Boolean'
  | 'Date'
  | '[String]';

export interface IDataExtensionNativeField {
  /** GraphQL field name. */
  name: string;
  graphqlType: DataExtensionNativeGraphqlType;
  /** Mongo path when it differs from `name`. Omit for computed fields. */
  path?: string;
  /** Computed by the owner adapter instead of read from a path. */
  computed?: boolean;
}

/**
 * Server-controlled record predicate. A lookup or patch only matches a
 * record that satisfies it, so field visibility follows the current state.
 */
export interface IDataExtensionRecordScope {
  customerStates?: string[];
  contactRoles?: string[];
}

export interface IDataExtensionRecordType {
  recordType: string;
  owner: DataExtensionOwner;
  /** GraphQL type name on the tenant endpoint. */
  typeName: string;
  label: string;
  /**
   * Owner storages the record can live in. Record types that share a
   * storage share the record's namespace, so their keys must not collide.
   */
  storages: string[];
  idKind: 'string' | 'objectId';
  readAction: string;
  updateAction: string;
  nativeFields: IDataExtensionNativeField[];
  scope?: IDataExtensionRecordScope;
  /** erxes content types whose screens show records of this type. */
  contentTypes: string[];
  /**
   * Root mutation fields that create a record of this type from a module's
   * create form; the UI writes the form's values right after they return.
   */
  createMutations?: string[];
  /** A tenant-defined object: records are created and listed here. */
  custom?: boolean;
  icon?: string;
  singularLabel?: string;
  description?: string;
}

export type DataExtensionRelationKind =
  (typeof DATA_EXTENSION_RELATION_KINDS)[number];

/**
 * A relation is two paired fields. The source stores the link; the inverse
 * lives on the target record type and is read-only.
 */
export interface IDataExtensionRelation {
  targetRecordType: string;
  kind: DataExtensionRelationKind;
  side: 'source' | 'inverse';
  inverseFieldId?: string;
}

export type DataExtensionOptionColor =
  (typeof DATA_EXTENSION_OPTION_COLORS)[number];

export interface IDataExtensionFieldOption {
  value: string;
  label: string;
  color?: DataExtensionOptionColor;
}

/**
 * Optional behaviour of a field. Every setting is checked by the owner on
 * each write, the same place the type is checked, so no client can skip it.
 */
export interface IDataExtensionFieldSettings {
  /** A value cannot be cleared once set; create forms ask for it. */
  required?: boolean;
  /** No two records of the record type share a value. Set at creation. */
  unique?: boolean;
  /** Pre-filled on create forms; validated like any value. */
  defaultValue?: unknown;
  /** Bounds of a number, currency amount or percent. */
  min?: number;
  max?: number;
  /** Longest text accepted, below the type's own limit. */
  maxLength?: number;
  /** Rating scale, 3 to 10 stars. */
  scale?: number;
  /** ISO 4217 code offered first for currency fields. */
  currency?: string;
  /** Member fields: one team member or several. */
  multiple?: boolean;
  /** Decimals shown for numbers and percents. */
  precision?: number;
  /** Section the field is shown under on records. */
  group?: string;
  /** Shown on create forms; defaults to true. */
  showInCreate?: boolean;
  placeholder?: string;
  /** Formula fields: the expression and the type of its result. */
  expression?: string;
  resultType?: 'number' | 'text' | 'date' | 'boolean';
  /** Rollup fields: a total over the records a relation links. */
  rollup?: {
    /** Relation field on this record type whose records are totalled. */
    relation: string;
    op: 'count' | 'sum' | 'avg' | 'min' | 'max';
    /** Numeric field on the linked records; not needed for count. */
    field?: string;
  };
  /** `managers`: only Data Extensions managers see and change the value. */
  access?: 'everyone' | 'managers';
  /** Only Data Extensions managers can change the value. */
  readOnly?: boolean;
  /** Shown on forms only when another field matches; values stay writable. */
  visibleWhen?: { field: string; operator: 'eq' | 'neq' | 'in' | 'isNotEmpty'; value?: unknown };
}

export interface IDataExtensionField {
  recordType: string;
  key: string;
  label: string;
  description?: string;
  type: DataExtensionFieldType;
  options?: IDataExtensionFieldOption[];
  relation?: IDataExtensionRelation;
  settings?: IDataExtensionFieldSettings;
  order: number;
  status: DataExtensionFieldStatus;
  createdBy?: string;
  updatedBy?: string;
  storageKeys?: string[];
}

export interface IDataExtensionFieldDocument extends IDataExtensionField {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDataExtensionSchemaVersionDocument {
  _id: string;
  version: number;
  updatedAt: Date;
}

export interface IDataExtensionSnapshot {
  version: number;
  fields: IDataExtensionFieldDocument[];
}

export interface IDataExtensionCurrencyValue {
  amount: number;
  currency: string;
}

export type IDataExtensionAddressValue = Partial<
  Record<
    'street' | 'street2' | 'city' | 'state' | 'postalCode' | 'country',
    string
  >
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
  | Date
  | string[]
  | IDataExtensionCurrencyValue
  | IDataExtensionAddressValue
  | IDataExtensionFullNameValue
  | IDataExtensionLinkValue[]
  | IDataExtensionFileValue[]
  | Record<string, unknown>
  | unknown[];

export interface IDataExtensionPatchUpdate {
  $set: Record<string, DataExtensionValue>;
  $unset: Record<string, ''>;
}

/** What an owner returns for one record over its tRPC contract. */
export interface IDataExtensionRecord {
  _id: string;
  native: Record<string, unknown>;
  dataExtensions: Record<string, unknown>;
}
