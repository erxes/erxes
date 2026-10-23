/** Record path that holds tenant-defined values on an owner document. */
export const DATA_EXTENSIONS_NAMESPACE = 'dataExtensions';

/** Bumped when generated schemas change shape for the same metadata. */
export const DATA_EXTENSIONS_ENGINE_VERSION = 1;

export const DATA_EXTENSION_FIELDS_COLLECTION = 'data_extensions_fields';
export const DATA_EXTENSION_SCHEMA_VERSIONS_COLLECTION =
  'data_extensions_schema_versions';

/** The single version document per tenant database. */
export const DATA_EXTENSION_SCHEMA_VERSION_ID = 'current';

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

/**
 * How a relation stores its link. The source record holds the target id
 * (`manyToOne`, `oneToOne`) or ids (`manyToMany`); the inverse side on the
 * target is virtual: reads query the source, writes are applied to the
 * source records.
 */
export const DATA_EXTENSION_RELATION_KINDS = [
  'manyToOne',
  'oneToOne',
  'manyToMany',
] as const;

/**
 * Kinds offered when creating a relation. `oneToMany` is stored as a
 * `manyToOne` pair started from the other record type, as in Twenty: the
 * "many" side holds the link.
 */
export const DATA_EXTENSION_RELATION_CREATE_KINDS = [
  'manyToOne',
  'oneToMany',
  'oneToOne',
  'manyToMany',
] as const;

export const DATA_EXTENSION_FIELD_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  /** A relation side whose pair is still being created; never read. */
  PENDING: 'pending',
} as const;

/**
 * Keys double as GraphQL field names and Mongo sub-paths, so they must be
 * plain identifiers: no dots, no `$`, no leading underscore.
 */
export const DATA_EXTENSION_FIELD_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,62}$/;

export const DATA_EXTENSION_RESERVED_KEYS = [
  'id',
  'typename',
  'constructor',
  'prototype',
  'proto',
  'toString',
  'valueOf',
  'hasOwnProperty',
  'dataExtensions',
  'createdAt',
  'updatedAt',
] as const;

export const DATA_EXTENSION_LIMITS = {
  fieldsPerRecordType: 100,
  labelLength: 120,
  descriptionLength: 500,
  optionsPerField: 100,
  optionValueLength: 100,
  textLength: 2000,
  longTextLength: 20000,
  multiSelectValues: 50,
  patchKeys: 100,
  recordsPerLookup: 100,
  relationsPerRecordType: 20,
  relationIdsPerValue: 100,
  relationPageSize: 20,
  relationPageMax: 100,
  searchPageSize: 20,
  searchPageMax: 50,
  searchTextLength: 100,
} as const;
