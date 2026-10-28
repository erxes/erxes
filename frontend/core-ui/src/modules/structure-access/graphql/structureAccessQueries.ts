import { gql } from '@apollo/client';

const USER_FIELDS = `
  _id
  email
  details {
    avatar
    fullName
  }
`;

const ENTITY_FIELDS = `
  _id
  title
  code
  order
  status
  typeId
  type {
    _id
    name
    code
  }
`;

const MEMBER_FIELDS = `
  _id
  entityId
  userId
  seatIds
  seats {
    _id
    coverage
    position {
      _id
      name
    }
  }
  isPrimary
  startsAt
  endsAt
  isActive
  createdAt
  entity {
    ${ENTITY_FIELDS}
  }
  user {
    ${USER_FIELDS}
  }
`;

const SEAT_FIELDS = `
  _id
  positionId
  position {
    _id
    name
    groupIds
    groups {
      _id
      name
      plugin
    }
  }
  entityId
  entity {
    ${ENTITY_FIELDS}
  }
  coverage
  coveredEntityIds
  coveredEntities {
    _id
    title
    code
  }
  holders {
    ${USER_FIELDS}
  }
  holderCount
  createdAt
`;

export const STRUCTURE_ACCESS_MEMBERS = gql`
  query StructureAccessMembers(
    $entityId: String
    $userId: String
    $includeEnded: Boolean
  ) {
    structureEntityMembers(
      entityId: $entityId
      userId: $userId
      includeEnded: $includeEnded
    ) {
      ${MEMBER_FIELDS}
    }
  }
`;

export const STRUCTURE_ACCESS_POSITIONS = gql`
  query StructureAccessPositions($searchValue: String) {
    structurePositions(searchValue: $searchValue) {
      _id
      name
      description
      groupIds
      groups {
        _id
        name
        plugin
      }
      seatCount
      createdAt
    }
  }
`;

export const STRUCTURE_ACCESS_SEATS = gql`
  query StructureAccessSeats($entityId: String, $userId: String) {
    structureSeats(entityId: $entityId, userId: $userId) {
      ${SEAT_FIELDS}
    }
  }
`;

export const STRUCTURE_ACCESS_ROOT = gql`
  query StructureAccessRoot {
    structureEntityRoot {
      _id
      typeId
      title
      code
      order
    }
  }
`;
