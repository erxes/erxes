import {
  DATA_EXTENSION_FIELD_STATUSES,
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_RELATION_KINDS,
} from './constants';

export type DataExtensionFieldType = (typeof DATA_EXTENSION_FIELD_TYPES)[number];

export type DataExtensionFieldStatus =
  (typeof DATA_EXTENSION_FIELD_STATUSES)[keyof typeof DATA_EXTENSION_FIELD_STATUSES];

export type DataExtensionOwner = 'core' | 'operation';

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

export interface IDataExtensionFieldOption {
  value: string;
  label: string;
}

export interface IDataExtensionField {
  recordType: string;
  key: string;
  label: string;
  description?: string;
  type: DataExtensionFieldType;
  options?: IDataExtensionFieldOption[];
  relation?: IDataExtensionRelation;
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

export type DataExtensionValue = string | number | boolean | Date | string[];

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
