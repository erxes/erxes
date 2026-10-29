import { REACT_APP_API_URL } from 'erxes-ui';
import {
  DATA_EXTENSION_ADDRESS_PARTS,
  DataExtensionFieldType,
  IDataExtensionField,
  IDataExtensionRecordType,
  isListRelation,
} from '../types';

export const DATA_EXTENSIONS_ENDPOINT = `${REACT_APP_API_URL}/data-extensions/graphql`;

// The tenant endpoint reuses type names such as Company, so its results stay
// out of the shared cache instead of overwriting main-graph entities.
export const typedRequestOptions = {
  context: { uri: DATA_EXTENSIONS_ENDPOINT },
  fetchPolicy: 'no-cache' as const,
};

/** Same rule the server enforces; checked again before building a document. */
const FIELD_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,62}$/;
const TYPE_NAME_PATTERN = /^[A-Z][A-Za-z0-9]{0,62}$/;

/** Native fields shown to identify a record, per generated type. */
const SUMMARY_FIELDS: Record<string, string[]> = {
  Company: ['primaryName', 'primaryEmail'],
  Customer: ['firstName', 'lastName', 'primaryEmail'],
  Lead: ['firstName', 'lastName', 'primaryEmail'],
  Vendor: ['displayName', 'contactType'],
  Client: ['displayName', 'contactType'],
  TeamMember: ['fullName', 'email'],
  OperationNote: ['content'],
};

export const getSummaryFields = (typeName: string) =>
  SUMMARY_FIELDS[typeName] || ['name'];

const lowerFirst = (value: string) =>
  value.charAt(0).toLowerCase() + value.slice(1);

export const getTypedOperationNames = (typeName: string) => {
  if (!TYPE_NAME_PATTERN.test(typeName)) {
    throw new Error(`Unexpected type name ${typeName}`);
  }

  const base = lowerFirst(typeName);

  return {
    lookup: base,
    lookupMany: `${base}Many`,
    search: `${base}Search`,
    patch: `${base}DataExtensionsPatch`,
    patchInput: `${typeName}DataExtensionsPatch`,
  };
};

const safeKeys = (fields: IDataExtensionField[]) =>
  fields.map((field) => field.key).filter((key) => FIELD_KEY_PATTERN.test(key));

/**
 * Has-many lists are loaded up to the server's page maximum, so a list that
 * fits can be edited as a whole.
 */
export const LINKED_RECORDS_PAGE = 100;

const targetTypeName = (
  field: IDataExtensionField,
  recordTypes: IDataExtensionRecordType[],
) =>
  recordTypes.find(
    (candidate) => candidate.recordType === field.relation?.targetRecordType,
  )?.typeName;

/** Sub-selections of composite values; they mirror the server's shared types. */
const COMPOSITE_SELECTIONS: Partial<Record<DataExtensionFieldType, string>> = {
  currency: '{ amount currency }',
  address: `{ ${DATA_EXTENSION_ADDRESS_PARTS.join(' ')} }`,
  fullName: '{ firstName lastName }',
  links: '{ url label }',
  files: '{ url name type size }',
  member: `{ _id ${SUMMARY_FIELDS.TeamMember.join(' ')} }`,
};

/** `key` or `key { _id ...summary }` for a relation, with a page size on lists. */
const fieldSelection = (
  field: IDataExtensionField,
  recordTypes: IDataExtensionRecordType[],
) => {
  if (!field.relation) {
    const composite = COMPOSITE_SELECTIONS[field.type];

    return composite ? `${field.key} ${composite}` : field.key;
  }

  const typeName = targetTypeName(field, recordTypes);

  if (!typeName || !TYPE_NAME_PATTERN.test(typeName)) {
    return '';
  }

  const args =
    field.relation.side === 'inverse' && isListRelation(field.relation)
      ? `(limit: ${LINKED_RECORDS_PAGE})`
      : '';

  return `${field.key}${args} { _id ${getSummaryFields(typeName).join(' ')} }`;
};

const selection = (
  recordType: IDataExtensionRecordType,
  fields: IDataExtensionField[],
  recordTypes: IDataExtensionRecordType[],
) => {
  const summary = getSummaryFields(recordType.typeName).join(' ');
  const parts = fields
    .filter((field) => FIELD_KEY_PATTERN.test(field.key))
    .map((field) => fieldSelection(field, recordTypes))
    .filter(Boolean);
  const values = parts.length ? ` dataExtensions { ${parts.join(' ')} }` : '';

  return `_id ${summary}${values}`;
};

export const buildRecordQuery = (
  recordType: IDataExtensionRecordType,
  fields: IDataExtensionField[],
  recordTypes: IDataExtensionRecordType[],
) => {
  const { lookup } = getTypedOperationNames(recordType.typeName);

  return `query DataExtensionsRecordValues($_id: ID!) {
  record: ${lookup}(_id: $_id) { ${selection(recordType, fields, recordTypes)} }
}`;
};

/** Name search for record pickers; works for every record type. */
export const buildSearchQuery = (recordType: IDataExtensionRecordType) => {
  const { search } = getTypedOperationNames(recordType.typeName);
  const summary = getSummaryFields(recordType.typeName).join(' ');

  return `query DataExtensionsRecordSearch($searchValue: String, $limit: Int) {
  records: ${search}(searchValue: $searchValue, limit: $limit) { _id ${summary} }
}`;
};

/** Names for ids a picker shows but has not seen in a search yet. */
export const buildNamesQuery = (recordType: IDataExtensionRecordType) => {
  const { lookupMany } = getTypedOperationNames(recordType.typeName);
  const summary = getSummaryFields(recordType.typeName).join(' ');

  return `query DataExtensionsRecordNames($_ids: [ID!]!) {
  records: ${lookupMany}(_ids: $_ids) { _id ${summary} }
}`;
};

export const buildPatchMutation = (
  recordType: IDataExtensionRecordType,
  fields: IDataExtensionField[],
  recordTypes: IDataExtensionRecordType[],
) => {
  const { patch, patchInput } = getTypedOperationNames(recordType.typeName);

  return `mutation DataExtensionsRecordPatch($_id: ID!, $values: ${patchInput}!) {
  record: ${patch}(_id: $_id, values: $values) { ${selection(
    recordType,
    fields,
    recordTypes,
  )} }
}`;
};

/** Readable name of a linked record from its summary fields. */
export const describeLinkedRecord = (record: Record<string, unknown>) =>
  Object.entries(record)
    .filter(
      ([key, value]) =>
        key !== '_id' &&
        !key.startsWith('__') &&
        typeof value === 'string' &&
        value,
    )
    .map(([, value]) => value as string)
    .join(' · ') || String(record._id);

const exampleValue = (
  type: DataExtensionFieldType,
  field: IDataExtensionField,
) => {
  switch (type) {
    case 'number':
      return '42';
    case 'boolean':
      return 'true';
    case 'date':
      return '"2027-06-01T00:00:00.000Z"';
    case 'select':
      return JSON.stringify(field.options?.[0]?.value || 'value');
    case 'multiSelect':
      return JSON.stringify(
        (field.options || []).slice(0, 2).map((option) => option.value),
      );
    case 'email':
      return '"name@example.com"';
    case 'url':
      return '"https://example.com"';
    case 'phone':
      return '"+976 9911 2233"';
    case 'relation':
      return field.relation && isListRelation(field.relation)
        ? '["RELATED_ID"]'
        : '"RELATED_ID"';
    case 'currency':
      return `{ amount: 1500000, currency: "${field.settings?.currency || 'MNT'}" }`;
    case 'dateTime':
      return '"2027-06-01T09:30:00.000Z"';
    case 'rating':
      return '4';
    case 'percent':
      return '75';
    case 'address':
      return '{ street: "Peace Avenue 17", city: "Ulaanbaatar", country: "MN" }';
    case 'fullName':
      return '{ firstName: "Bat", lastName: "Dorj" }';
    case 'links':
      return '[{ url: "https://erxes.io", label: "Website" }]';
    case 'emails':
      return '["sales@example.com"]';
    case 'phones':
      return '["+976 9911 2233"]';
    case 'files':
      return '[{ url: "FILE_KEY", name: "contract.pdf" }]';
    case 'member':
      return field.settings?.multiple ? '["USER_ID"]' : '"USER_ID"';
    case 'json':
      return '{ source: "import" }';
    default:
      return '"Example"';
  }
};

/** Readable examples for the API tab; mirrors the generated schema. */
export const buildApiExamples = (
  recordType: IDataExtensionRecordType,
  fields: IDataExtensionField[],
  recordTypes: IDataExtensionRecordType[],
) => {
  const { lookup, patch } = getTypedOperationNames(recordType.typeName);
  const keys = safeKeys(fields);
  const summary = getSummaryFields(recordType.typeName).join('\n    ');
  const parts = fields
    .filter((field) => FIELD_KEY_PATTERN.test(field.key))
    .map((field) => fieldSelection(field, recordTypes))
    .filter(Boolean);
  const valueSelection = parts.length
    ? `\n    dataExtensions {\n      ${parts.join('\n      ')}\n    }`
    : '';

  const query = `query {
  ${lookup}(_id: "RECORD_ID") {
    _id
    ${summary}${valueSelection}
  }
}`;

  const patchValues = fields
    .filter((field) => FIELD_KEY_PATTERN.test(field.key))
    .slice(0, 3)
    .map((field) => `${field.key}: ${exampleValue(field.type, field)}`)
    .join('\n      ');

  const mutation = keys.length
    ? `mutation {
  ${patch}(
    _id: "RECORD_ID"
    values: {
      ${patchValues}
    }
  ) {
    _id${valueSelection.replace(/\n {4}/g, '\n    ')}
  }
}`
    : '';

  return { endpoint: DATA_EXTENSIONS_ENDPOINT, query, mutation };
};
