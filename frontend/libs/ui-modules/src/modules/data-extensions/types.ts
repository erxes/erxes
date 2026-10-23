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
  fieldCount: number;
}

export type DataExtensionValue = string | number | boolean | string[] | null;

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

/** A relation side whose list of links can hold more than one record. */
export const isListRelation = (relation: IDataExtensionRelation) =>
  relation.kind === 'manyToMany' ||
  (relation.side === 'inverse' && relation.kind === 'manyToOne');
