import { gql } from '@apollo/client';

const STRUCTURE_ENTITY_PARAM_DEFS = `
  $code: String
  $description: String
  $location: StructureLocationInput
  $contact: StructureContactInput
  $schedule: StructureScheduleInput
  $propertiesData: JSON
`;

const STRUCTURE_ENTITY_PARAMS = `
  code: $code
  description: $description
  location: $location
  contact: $contact
  schedule: $schedule
  propertiesData: $propertiesData
`;

export const STRUCTURE_ENTITIES_ADD = gql`
  mutation StructureEntitiesAdd(
    $typeId: String!
    $parentId: String!
    $title: String!
    ${STRUCTURE_ENTITY_PARAM_DEFS}
  ) {
    structureEntitiesAdd(
      typeId: $typeId
      parentId: $parentId
      title: $title
      ${STRUCTURE_ENTITY_PARAMS}
    ) {
      _id
    }
  }
`;

export const STRUCTURE_ENTITIES_EDIT = gql`
  mutation StructureEntitiesEdit(
    $_id: String!
    $title: String
    ${STRUCTURE_ENTITY_PARAM_DEFS}
  ) {
    structureEntitiesEdit(
      _id: $_id
      title: $title
      ${STRUCTURE_ENTITY_PARAMS}
    ) {
      _id
      title
      code
      description
      propertiesData
      location {
        address
        coordinate {
          latitude
          longitude
        }
        radius
      }
      contact {
        phoneNumber
        email
        links
        image {
          url
          name
          type
          size
        }
      }
      schedule {
        workhours
        holidays
      }
    }
  }
`;

export const STRUCTURE_ENTITIES_MOVE = gql`
  mutation StructureEntitiesMove($_id: String!, $parentId: String!) {
    structureEntitiesMove(_id: $_id, parentId: $parentId) {
      _id
    }
  }
`;

export const STRUCTURE_ENTITIES_CHANGE_TYPE = gql`
  mutation StructureEntitiesChangeType($_id: String!, $typeId: String!) {
    structureEntitiesChangeType(_id: $_id, typeId: $typeId) {
      _id
      typeId
    }
  }
`;

export const STRUCTURE_ENTITIES_ARCHIVE = gql`
  mutation StructureEntitiesArchive($_id: String!) {
    structureEntitiesArchive(_id: $_id) {
      _id
    }
  }
`;

export const STRUCTURE_ENTITIES_RESTORE = gql`
  mutation StructureEntitiesRestore($_id: String!) {
    structureEntitiesRestore(_id: $_id) {
      _id
    }
  }
`;

const STRUCTURE_ENTITY_TYPE_PARAM_DEFS = `
  $name: String
  $code: String
  $description: String
  $icon: String
  $parentTypeIds: [String]
  $capabilities: [String]
  $legacyKind: String
`;

const STRUCTURE_ENTITY_TYPE_PARAMS = `
  name: $name
  code: $code
  description: $description
  icon: $icon
  parentTypeIds: $parentTypeIds
  capabilities: $capabilities
  legacyKind: $legacyKind
`;

export const STRUCTURE_ENTITY_TYPES_ADD = gql`
  mutation StructureEntityTypesAdd(${STRUCTURE_ENTITY_TYPE_PARAM_DEFS}) {
    structureEntityTypesAdd(${STRUCTURE_ENTITY_TYPE_PARAMS}) {
      _id
    }
  }
`;

export const STRUCTURE_ENTITY_TYPES_EDIT = gql`
  mutation StructureEntityTypesEdit(
    $_id: String!
    ${STRUCTURE_ENTITY_TYPE_PARAM_DEFS}
  ) {
    structureEntityTypesEdit(_id: $_id, ${STRUCTURE_ENTITY_TYPE_PARAMS}) {
      _id
    }
  }
`;

export const STRUCTURE_ENTITY_TYPES_REMOVE = gql`
  mutation StructureEntityTypesRemove($_id: String!) {
    structureEntityTypesRemove(_id: $_id) {
      _id
    }
  }
`;
