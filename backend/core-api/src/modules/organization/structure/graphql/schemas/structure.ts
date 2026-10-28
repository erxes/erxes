import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type StructureCapability {
    key: String!
    label: String!
    description: String
    plugin: String!
  }

  type StructureEntityType @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String!
    code: String!
    description: String
    icon: String
    parentTypeIds: [String]
    capabilities: [String]
    legacyKind: String
    isSystem: Boolean
    entityCount: Int
    createdAt: Date
    updatedAt: Date
  }

  type StructureLocation {
    address: String
    coordinate: Coordinate
    radius: Int
  }

  type StructureContact {
    phoneNumber: String
    email: String
    links: JSON
    image: Attachment
  }

  type StructureSchedule {
    workhours: JSON
    holidays: JSON
  }

  type StructureEntity @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    typeId: String!
    type: StructureEntityType
    parentId: String
    parent: StructureEntity
    path: [StructureEntity]
    order: String!
    title: String!
    code: String
    description: String
    status: String
    location: StructureLocation
    contact: StructureContact
    schedule: StructureSchedule
    propertiesData: JSON
    childCount: Int
    memberCount: Int
    seatCount: Int
    archivedAt: Date
    createdAt: Date
    updatedAt: Date
  }

  type StructureEntityListResponse {
    list: [StructureEntity]
    totalCount: Int
    pageInfo: PageInfo
  }

  type StructurePosition @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String!
    description: String
    groupIds: [String]
    groups: [PermissionGroup]
    seatCount: Int
    createdAt: Date
    updatedAt: Date
  }

  type StructureSeat @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    positionId: String!
    position: StructurePosition
    entityId: String!
    entity: StructureEntity
    coverage: String!
    coveredEntityIds: [String]
    coveredEntities: [StructureEntity]
    holders: [User]
    holderCount: Int
    createdAt: Date
    updatedAt: Date
  }

  type StructureEntityMember {
    _id: String!
    entityId: String!
    entity: StructureEntity
    userId: String!
    user: User
    seatIds: [String]
    seats: [StructureSeat]
    isPrimary: Boolean
    startsAt: Date
    endsAt: Date
    isActive: Boolean
    createdAt: Date
  }

  input StructureLocationInput {
    address: String
    coordinate: CoordinateInput
    radius: Int
  }

  input StructureContactInput {
    phoneNumber: String
    email: String
    links: JSON
    image: AttachmentInput
  }

  input StructureScheduleInput {
    workhours: JSON
    holidays: JSON
  }
`;

const typeParams = `
  name: String
  code: String
  description: String
  icon: String
  parentTypeIds: [String]
  capabilities: [String]
  legacyKind: String
`;

const entityParams = `
  code: String
  description: String
  location: StructureLocationInput
  contact: StructureContactInput
  schedule: StructureScheduleInput
  propertiesData: JSON
`;

export const queries = `
  structureCapabilities: [StructureCapability]
  structureEntityTypes(searchValue: String, capability: String): [StructureEntityType]
  structureEntityTypeDetail(_id: String!): StructureEntityType
  structureEntityRoot: StructureEntity
  structureEntities(
    ids: [String]
    excludeIds: Boolean
    typeIds: [String]
    parentId: String
    descendantOf: String
    capability: String
    includeArchived: Boolean
    searchValue: String
    ${GQL_CURSOR_PARAM_DEFS}
  ): StructureEntityListResponse
  structureEntityDetail(_id: String!): StructureEntity
  structureEntityMembers(entityId: String, userId: String, includeEnded: Boolean): [StructureEntityMember]
  structurePositions(searchValue: String): [StructurePosition]
  structureSeats(entityId: String, userId: String): [StructureSeat]
`;

export const mutations = `
  structureEntityTypesAdd(${typeParams}): StructureEntityType
  structureEntityTypesEdit(_id: String!, ${typeParams}): StructureEntityType
  structureEntityTypesRemove(_id: String!): StructureEntityType

  structureEntitiesAdd(typeId: String!, parentId: String!, title: String!, ${entityParams}): StructureEntity
  structureEntitiesEdit(_id: String!, title: String, ${entityParams}): StructureEntity
  structureEntitiesMove(_id: String!, parentId: String!): StructureEntity
  structureEntitiesChangeType(_id: String!, typeId: String!): StructureEntity
  structureEntitiesArchive(_id: String!): StructureEntity
  structureEntitiesRestore(_id: String!): StructureEntity

  structureEntityMembersAdd(
    entityId: String!
    userId: String!
    isPrimary: Boolean
    startsAt: Date
    endsAt: Date
  ): StructureEntityMember
  structureEntityMembersEdit(_id: String!, isPrimary: Boolean, endsAt: Date): StructureEntityMember
  structureEntityMembersEnd(_id: String!, endsAt: Date): StructureEntityMember

  structurePositionsAdd(name: String!, description: String, groupIds: [String]): StructurePosition
  structurePositionsEdit(_id: String!, name: String, description: String, groupIds: [String]): StructurePosition
  structurePositionsRemove(_id: String!): StructurePosition

  structureSeatsAdd(entityId: String!, positionId: String!, coverage: String!, coveredEntityIds: [String]): StructureSeat
  structureSeatsEdit(_id: String!, coverage: String, coveredEntityIds: [String]): StructureSeat
  structureSeatsRemove(_id: String!): StructureSeat
  structureSeatHoldersAdd(seatId: String!, userIds: [String!]!): StructureSeat
  structureSeatHoldersRemove(seatId: String!, userId: String!): StructureSeat
`;
