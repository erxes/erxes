import { AsyncLocalStorage } from 'async_hooks';
import {
  DATA_EXTENSION_CUSTOM_PREFIX,
  DATA_EXTENSION_RECORD_ACTIONS,
  DATA_EXTENSION_RECORDS_COLLECTION_PREFIX,
} from './constants';
import {
  IDataExtensionNativeField,
  IDataExtensionObject,
  IDataExtensionRecordType,
} from './types';

const timestamps: IDataExtensionNativeField[] = [
  { name: 'createdAt', graphqlType: 'Date' },
  { name: 'updatedAt', graphqlType: 'Date' },
];

const companyFields: IDataExtensionNativeField[] = [
  { name: '_id', graphqlType: 'ID' },
  { name: 'primaryName', graphqlType: 'String' },
  { name: 'primaryEmail', graphqlType: 'String' },
  { name: 'primaryPhone', graphqlType: 'String' },
  { name: 'code', graphqlType: 'String' },
  { name: 'website', graphqlType: 'String' },
  { name: 'industry', graphqlType: '[String]' },
  { name: 'businessType', graphqlType: 'String' },
  { name: 'status', graphqlType: 'String' },
  ...timestamps,
];

const customerFields: IDataExtensionNativeField[] = [
  { name: '_id', graphqlType: 'ID' },
  { name: 'firstName', graphqlType: 'String' },
  { name: 'middleName', graphqlType: 'String' },
  { name: 'lastName', graphqlType: 'String' },
  { name: 'primaryEmail', graphqlType: 'String' },
  { name: 'primaryPhone', graphqlType: 'String' },
  { name: 'code', graphqlType: 'String' },
  { name: 'state', graphqlType: 'String' },
  { name: 'status', graphqlType: 'String' },
  ...timestamps,
];

const contactRoleFields: IDataExtensionNativeField[] = [
  { name: '_id', graphqlType: 'ID' },
  { name: 'contactType', graphqlType: 'String', computed: true },
  { name: 'displayName', graphqlType: 'String', computed: true },
  { name: 'primaryEmail', graphqlType: 'String' },
  { name: 'primaryPhone', graphqlType: 'String' },
  { name: 'contactRoles', graphqlType: '[String]' },
  ...timestamps,
];

/**
 * Team members expose profile identity only. Credentials, tokens,
 * permission groups and roles never leave the owner through this contract.
 */
const teamMemberFields: IDataExtensionNativeField[] = [
  { name: '_id', graphqlType: 'ID' },
  { name: 'username', graphqlType: 'String' },
  { name: 'email', graphqlType: 'String' },
  { name: 'isActive', graphqlType: 'Boolean' },
  { name: 'fullName', graphqlType: 'String', path: 'details.fullName' },
  { name: 'position', graphqlType: 'String', path: 'details.position' },
  { name: 'createdAt', graphqlType: 'Date' },
];

export const DATA_EXTENSION_RECORD_TYPES: IDataExtensionRecordType[] = [
  {
    recordType: 'core:company',
    contentTypes: ['core:company'],
    createMutations: ['companiesAdd'],
    owner: 'core',
    typeName: 'Company',
    label: 'Companies',
    storages: ['core:companies'],
    idKind: 'string',
    readAction: 'contactsRead',
    updateAction: 'contactsUpdate',
    nativeFields: companyFields,
  },
  {
    recordType: 'core:customer',
    contentTypes: ['core:customer'],
    createMutations: ['customersAdd'],
    owner: 'core',
    typeName: 'Customer',
    label: 'Customers',
    storages: ['core:customers'],
    idKind: 'string',
    readAction: 'contactsRead',
    updateAction: 'contactsUpdate',
    nativeFields: customerFields,
    scope: { customerStates: ['customer'] },
  },
  {
    recordType: 'core:lead',
    contentTypes: ['core:customer'],
    createMutations: ['customersAdd'],
    owner: 'core',
    typeName: 'Lead',
    label: 'Leads',
    storages: ['core:customers'],
    idKind: 'string',
    readAction: 'contactsRead',
    updateAction: 'contactsUpdate',
    nativeFields: customerFields,
    scope: { customerStates: ['lead'] },
  },
  {
    recordType: 'core:vendor',
    contentTypes: ['core:company', 'core:customer'],
    owner: 'core',
    typeName: 'Vendor',
    label: 'Vendors',
    storages: ['core:companies', 'core:customers'],
    idKind: 'string',
    readAction: 'contactsRead',
    updateAction: 'contactsUpdate',
    nativeFields: contactRoleFields,
    scope: { contactRoles: ['vendor'] },
  },
  {
    recordType: 'core:client',
    contentTypes: ['core:company', 'core:customer'],
    owner: 'core',
    typeName: 'Client',
    label: 'Clients',
    storages: ['core:companies', 'core:customers'],
    idKind: 'string',
    readAction: 'contactsRead',
    updateAction: 'contactsUpdate',
    nativeFields: contactRoleFields,
    scope: { contactRoles: ['client'] },
  },
  {
    recordType: 'core:teamMember',
    contentTypes: ['core:user'],
    owner: 'core',
    typeName: 'TeamMember',
    label: 'Team members',
    storages: ['core:users'],
    idKind: 'string',
    readAction: 'teamMembersRead',
    updateAction: 'teamMembersUpdate',
    nativeFields: teamMemberFields,
  },
  {
    recordType: 'operation:task',
    contentTypes: ['operation:task'],
    createMutations: ['createTask'],
    owner: 'operation',
    typeName: 'OperationTask',
    label: 'Tasks',
    storages: ['operation:tasks'],
    idKind: 'objectId',
    readAction: 'taskRead',
    updateAction: 'taskUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'number', graphqlType: 'Int' },
      { name: 'status', graphqlType: 'String' },
      { name: 'priority', graphqlType: 'Int' },
      { name: 'teamId', graphqlType: 'String' },
      { name: 'projectId', graphqlType: 'String' },
      { name: 'milestoneId', graphqlType: 'String' },
      { name: 'cycleId', graphqlType: 'String' },
      { name: 'assigneeId', graphqlType: 'String' },
      { name: 'createdBy', graphqlType: 'String' },
      { name: 'startDate', graphqlType: 'Date' },
      { name: 'targetDate', graphqlType: 'Date' },
      ...timestamps,
    ],
  },
  {
    recordType: 'operation:triage',
    contentTypes: ['operation:triage'],
    owner: 'operation',
    typeName: 'OperationTriage',
    label: 'Triage',
    storages: ['operation:triage'],
    idKind: 'objectId',
    readAction: 'triageRead',
    updateAction: 'triageUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'number', graphqlType: 'Int' },
      { name: 'teamId', graphqlType: 'String' },
      { name: 'priority', graphqlType: 'Int' },
      { name: 'createdBy', graphqlType: 'String' },
      ...timestamps,
    ],
  },
  {
    recordType: 'operation:project',
    contentTypes: ['operation:project'],
    createMutations: ['createProject'],
    owner: 'operation',
    typeName: 'OperationProject',
    label: 'Projects',
    storages: ['operation:projects'],
    idKind: 'objectId',
    readAction: 'projectRead',
    updateAction: 'projectUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'status', graphqlType: 'Int' },
      { name: 'priority', graphqlType: 'Int' },
      { name: 'teamIds', graphqlType: '[String]' },
      { name: 'leadId', graphqlType: 'String' },
      { name: 'startDate', graphqlType: 'Date' },
      { name: 'targetDate', graphqlType: 'Date' },
      ...timestamps,
    ],
  },
  {
    recordType: 'operation:milestone',
    contentTypes: ['operation:milestone'],
    owner: 'operation',
    typeName: 'OperationMilestone',
    label: 'Milestones',
    storages: ['operation:milestones'],
    idKind: 'objectId',
    readAction: 'milestoneRead',
    updateAction: 'milestoneUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'projectId', graphqlType: 'String' },
      { name: 'targetDate', graphqlType: 'Date' },
      ...timestamps,
    ],
  },
  {
    recordType: 'operation:team',
    contentTypes: ['operation:team'],
    owner: 'operation',
    typeName: 'OperationTeam',
    label: 'Teams',
    storages: ['operation:teams'],
    idKind: 'objectId',
    readAction: 'teamRead',
    updateAction: 'teamUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'icon', graphqlType: 'String' },
      { name: 'description', graphqlType: 'String' },
      ...timestamps,
    ],
  },
  {
    recordType: 'operation:cycle',
    contentTypes: ['operation:cycle'],
    owner: 'operation',
    typeName: 'OperationCycle',
    label: 'Cycles',
    storages: ['operation:cycles'],
    idKind: 'objectId',
    readAction: 'cycleRead',
    updateAction: 'cycleUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'number', graphqlType: 'Int' },
      { name: 'teamId', graphqlType: 'String' },
      { name: 'startDate', graphqlType: 'Date' },
      { name: 'endDate', graphqlType: 'Date' },
      { name: 'isActive', graphqlType: 'Boolean' },
      { name: 'isCompleted', graphqlType: 'Boolean' },
      ...timestamps,
    ],
  },
  {
    recordType: 'operation:status',
    contentTypes: ['operation:status'],
    owner: 'operation',
    typeName: 'OperationStatus',
    label: 'Statuses',
    storages: ['operation:statuses'],
    idKind: 'objectId',
    readAction: 'statusRead',
    updateAction: 'statusUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'type', graphqlType: 'Int' },
      { name: 'color', graphqlType: 'String' },
      { name: 'teamId', graphqlType: 'String' },
      { name: 'order', graphqlType: 'Int' },
      ...timestamps,
    ],
  },
  {
    recordType: 'operation:note',
    contentTypes: ['operation:note'],
    owner: 'operation',
    typeName: 'OperationNote',
    label: 'Notes',
    storages: ['operation:notes'],
    idKind: 'objectId',
    readAction: 'noteRead',
    updateAction: 'noteUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'content', graphqlType: 'String' },
      { name: 'contentId', graphqlType: 'String' },
      { name: 'createdBy', graphqlType: 'String' },
      ...timestamps,
    ],
  },
  {
    recordType: 'core:product',
    contentTypes: ['core:product'],
    createMutations: ['productsAdd'],
    owner: 'core',
    typeName: 'Product',
    label: 'Products',
    storages: ['core:products'],
    idKind: 'string',
    readAction: 'productsRead',
    updateAction: 'productsUpdate',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'code', graphqlType: 'String' },
      { name: 'type', graphqlType: 'String' },
      { name: 'unitPrice', graphqlType: 'Float' },
      { name: 'categoryId', graphqlType: 'String' },
      { name: 'status', graphqlType: 'String' },
      ...timestamps,
    ],
  },
  {
    recordType: 'sales:deal',
    contentTypes: ['sales:deal', 'sales:sales.deal'],
    createMutations: ['dealsAdd'],
    owner: 'sales',
    typeName: 'SalesDeal',
    label: 'Deals',
    storages: ['sales:deals'],
    idKind: 'string',
    readAction: 'showDeals',
    updateAction: 'dealsEdit',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'number', graphqlType: 'String' },
      { name: 'totalAmount', graphqlType: 'Float' },
      { name: 'stageId', graphqlType: 'String' },
      { name: 'status', graphqlType: 'String' },
      { name: 'closeDate', graphqlType: 'Date' },
      ...timestamps,
    ],
  },
  {
    recordType: 'frontline:ticket',
    contentTypes: ['frontline:ticket'],
    createMutations: ['createTicket'],
    owner: 'frontline',
    typeName: 'FrontlineTicket',
    label: 'Tickets',
    storages: ['frontline:tickets'],
    idKind: 'string',
    readAction: 'showTickets',
    updateAction: 'updateTicket',
    nativeFields: [
      { name: '_id', graphqlType: 'ID' },
      { name: 'name', graphqlType: 'String' },
      { name: 'number', graphqlType: 'String' },
      { name: 'type', graphqlType: 'String' },
      { name: 'state', graphqlType: 'String' },
      { name: 'priority', graphqlType: 'Int' },
      { name: 'statusId', graphqlType: 'String' },
      ...timestamps,
    ],
  },
];

const recordTypesByName = new Map(
  DATA_EXTENSION_RECORD_TYPES.map((descriptor) => [
    descriptor.recordType,
    descriptor,
  ]),
);

/**
 * Tenant-defined record types (custom objects) for the request being
 * served. The static registry is shared by every tenant; custom objects
 * differ per tenant, so core runs each Data Extensions request inside
 * `runWithDataExtensionRecordTypes` and lookups below see both. Outside such
 * a scope only the static registry exists, so nothing can resolve another
 * tenant's objects.
 */
const tenantRecordTypes = new AsyncLocalStorage<
  Map<string, IDataExtensionRecordType>
>();

export const runWithDataExtensionRecordTypes = <T>(
  custom: IDataExtensionRecordType[],
  run: () => T,
): T =>
  tenantRecordTypes.run(
    new Map(custom.map((descriptor) => [descriptor.recordType, descriptor])),
    run,
  );

/** Custom record types of the current request's tenant. */
export const getCustomDataExtensionRecordTypes =
  (): IDataExtensionRecordType[] =>
    Array.from(tenantRecordTypes.getStore()?.values() || []);

/** Static and custom record types the current request can use. */
export const getAllDataExtensionRecordTypes = (): IDataExtensionRecordType[] => [
  ...DATA_EXTENSION_RECORD_TYPES,
  ...getCustomDataExtensionRecordTypes(),
];

export const getDataExtensionRecordType = (
  recordType: string,
): IDataExtensionRecordType | undefined =>
  recordTypesByName.get(recordType) ||
  tenantRecordTypes.getStore()?.get(recordType);

/**
 * Record types whose values can sit on the same document. A key is unique
 * across this group because they all write the one `dataExtensions` object.
 */
export const getRecordTypesSharingStorage = (
  recordType: string,
): string[] => {
  const descriptor = getDataExtensionRecordType(recordType);

  if (!descriptor) {
    return [];
  }

  return getAllDataExtensionRecordTypes()
    .filter((candidate) =>
      candidate.storages.some((storage) =>
        descriptor.storages.includes(storage),
      ),
    )
    .map((candidate) => candidate.recordType);
};

/** Namespace slots a field occupies, one per storage it writes to. */
export const getDataExtensionStorageKeys = (
  recordType: string,
  key: string,
): string[] =>
  (getDataExtensionRecordType(recordType)?.storages || []).map(
    (storage) => `${storage}:${key}`,
  );

const upperFirst = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const lowerFirst = (value: string) =>
  value.charAt(0).toLowerCase() + value.slice(1);

/** Native fields every custom object record has. */
const customRecordFields: IDataExtensionNativeField[] = [
  { name: '_id', graphqlType: 'ID' },
  { name: 'name', graphqlType: 'String' },
  { name: 'createdBy', graphqlType: 'String' },
  ...timestamps,
];

export const getCustomRecordType = (objectKey: string) =>
  `${DATA_EXTENSION_CUSTOM_PREFIX}${objectKey}`;

export const getCustomRecordsCollection = (objectKey: string) =>
  `${DATA_EXTENSION_RECORDS_COLLECTION_PREFIX}${objectKey}`;

/** The record type a custom object gets; its records are core-owned. */
export const buildCustomDataExtensionRecordType = (
  object: Pick<
    IDataExtensionObject,
    'key' | 'singularLabel' | 'pluralLabel' | 'description' | 'icon'
  >,
): IDataExtensionRecordType => {
  const recordType = getCustomRecordType(object.key);

  return {
    recordType,
    owner: 'core',
    typeName: upperFirst(object.key),
    label: object.pluralLabel,
    singularLabel: object.singularLabel,
    description: object.description,
    icon: object.icon,
    custom: true,
    storages: [recordType],
    idKind: 'string',
    readAction: DATA_EXTENSION_RECORD_ACTIONS.read,
    updateAction: DATA_EXTENSION_RECORD_ACTIONS.manage,
    nativeFields: customRecordFields,
    contentTypes: [recordType],
  };
};

/** Suffixes the generated schema appends to a record type's name. */
const TYPE_SUFFIXES = [
  '',
  'DataExtensions',
  'DataExtensionsPatch',
  'DataExtensionsPatchItem',
  'DataExtensionsPatchResult',
  'List',
  'CreateInput',
  'UpdateInput',
];

const ROOT_SUFFIXES = [
  '',
  'Many',
  'Search',
  'DataExtensionsPatch',
  'DataExtensionsPatchMany',
  'List',
  'Create',
  'Update',
  'Delete',
];

/** Names no record type may generate: shared types and GraphQL built-ins. */
const RESERVED_TYPE_NAMES = new Set([
  'Query',
  'Mutation',
  'Subscription',
  'String',
  'Int',
  'Float',
  'Boolean',
  'ID',
  'Date',
  'JSON',
]);

/** Every type and root field name a record type adds to the schema. */
export const getGeneratedGraphqlNames = (
  descriptor: Pick<IDataExtensionRecordType, 'typeName'>,
) => ({
  types: TYPE_SUFFIXES.map((suffix) => `${descriptor.typeName}${suffix}`),
  roots: ROOT_SUFFIXES.map(
    (suffix) => `${lowerFirst(descriptor.typeName)}${suffix}`,
  ),
});

/**
 * The first generated name `candidate` would share with another record type
 * or a reserved name, if any. Names are compared case-insensitively so two
 * objects cannot differ only in case.
 */
export const findGeneratedNameClash = (
  candidate: Pick<IDataExtensionRecordType, 'typeName' | 'recordType'>,
  others: Pick<IDataExtensionRecordType, 'typeName' | 'recordType'>[],
): string | undefined => {
  const own = getGeneratedGraphqlNames(candidate);

  if (candidate.typeName.startsWith('DataExtension')) {
    return candidate.typeName;
  }

  for (const name of own.types) {
    if (RESERVED_TYPE_NAMES.has(name)) {
      return name;
    }
  }

  const taken = new Set<string>();

  for (const other of others) {
    if (other.recordType === candidate.recordType) {
      continue;
    }

    const names = getGeneratedGraphqlNames(other);

    for (const name of [...names.types, ...names.roots]) {
      taken.add(name.toLowerCase());
    }
  }

  return [...own.types, ...own.roots].find((name) =>
    taken.has(name.toLowerCase()),
  );
};
