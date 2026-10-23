import {
  IDataExtensionNativeField,
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
];

const recordTypesByName = new Map(
  DATA_EXTENSION_RECORD_TYPES.map((descriptor) => [
    descriptor.recordType,
    descriptor,
  ]),
);

export const getDataExtensionRecordType = (
  recordType: string,
): IDataExtensionRecordType | undefined => recordTypesByName.get(recordType);

/**
 * Record types whose values can sit on the same document. A key is unique
 * across this group because they all write the one `dataExtensions` object.
 */
export const getRecordTypesSharingStorage = (
  recordType: string,
): string[] => {
  const descriptor = recordTypesByName.get(recordType);

  if (!descriptor) {
    return [];
  }

  return DATA_EXTENSION_RECORD_TYPES.filter((candidate) =>
    candidate.storages.some((storage) => descriptor.storages.includes(storage)),
  ).map((candidate) => candidate.recordType);
};

/** Namespace slots a field occupies, one per storage it writes to. */
export const getDataExtensionStorageKeys = (
  recordType: string,
  key: string,
): string[] =>
  (recordTypesByName.get(recordType)?.storages || []).map(
    (storage) => `${storage}:${key}`,
  );
