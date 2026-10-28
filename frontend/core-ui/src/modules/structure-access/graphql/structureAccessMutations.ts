import { gql } from '@apollo/client';

export const STRUCTURE_ACCESS_MEMBER_ADD = gql`
  mutation StructureAccessMemberAdd(
    $entityId: String!
    $userId: String!
    $isPrimary: Boolean
    $startsAt: Date
    $endsAt: Date
  ) {
    structureEntityMembersAdd(
      entityId: $entityId
      userId: $userId
      isPrimary: $isPrimary
      startsAt: $startsAt
      endsAt: $endsAt
    ) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_MEMBER_EDIT = gql`
  mutation StructureAccessMemberEdit(
    $_id: String!
    $isPrimary: Boolean
    $endsAt: Date
  ) {
    structureEntityMembersEdit(
      _id: $_id
      isPrimary: $isPrimary
      endsAt: $endsAt
    ) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_MEMBER_END = gql`
  mutation StructureAccessMemberEnd($_id: String!, $endsAt: Date) {
    structureEntityMembersEnd(_id: $_id, endsAt: $endsAt) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_POSITION_ADD = gql`
  mutation StructureAccessPositionAdd(
    $name: String!
    $description: String
    $groupIds: [String]
  ) {
    structurePositionsAdd(
      name: $name
      description: $description
      groupIds: $groupIds
    ) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_POSITION_EDIT = gql`
  mutation StructureAccessPositionEdit(
    $_id: String!
    $name: String
    $description: String
    $groupIds: [String]
  ) {
    structurePositionsEdit(
      _id: $_id
      name: $name
      description: $description
      groupIds: $groupIds
    ) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_POSITION_REMOVE = gql`
  mutation StructureAccessPositionRemove($_id: String!) {
    structurePositionsRemove(_id: $_id) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_SEAT_ADD = gql`
  mutation StructureAccessSeatAdd(
    $entityId: String!
    $positionId: String!
    $coverage: String!
    $coveredEntityIds: [String]
  ) {
    structureSeatsAdd(
      entityId: $entityId
      positionId: $positionId
      coverage: $coverage
      coveredEntityIds: $coveredEntityIds
    ) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_SEAT_EDIT = gql`
  mutation StructureAccessSeatEdit(
    $_id: String!
    $coverage: String
    $coveredEntityIds: [String]
  ) {
    structureSeatsEdit(
      _id: $_id
      coverage: $coverage
      coveredEntityIds: $coveredEntityIds
    ) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_SEAT_REMOVE = gql`
  mutation StructureAccessSeatRemove($_id: String!) {
    structureSeatsRemove(_id: $_id) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_SEAT_HOLDERS_ADD = gql`
  mutation StructureAccessSeatHoldersAdd(
    $seatId: String!
    $userIds: [String!]!
  ) {
    structureSeatHoldersAdd(seatId: $seatId, userIds: $userIds) {
      _id
    }
  }
`;

export const STRUCTURE_ACCESS_SEAT_HOLDERS_REMOVE = gql`
  mutation StructureAccessSeatHoldersRemove(
    $seatId: String!
    $userId: String!
  ) {
    structureSeatHoldersRemove(seatId: $seatId, userId: $userId) {
      _id
    }
  }
`;
