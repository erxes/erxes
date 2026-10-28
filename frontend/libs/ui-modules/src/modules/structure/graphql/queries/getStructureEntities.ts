import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAMS,
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

const STRUCTURE_ENTITY_FIELDS = `
  _id
  typeId
  type {
    _id
    name
    code
    icon
  }
  parentId
  order
  title
  code
  status
  archivedAt
`;

export const STRUCTURE_ENTITIES_SELECT = gql`
  query StructureEntitiesSelect(
    $ids: [String]
    $excludeIds: Boolean
    $typeIds: [String]
    $parentId: String
    $descendantOf: String
    $capability: String
    $includeArchived: Boolean
    $searchValue: String
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    structureEntities(
      ids: $ids
      excludeIds: $excludeIds
      typeIds: $typeIds
      parentId: $parentId
      descendantOf: $descendantOf
      capability: $capability
      includeArchived: $includeArchived
      searchValue: $searchValue
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        ${STRUCTURE_ENTITY_FIELDS}
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const STRUCTURE_ENTITY_DETAIL_SELECT = gql`
  query StructureEntityDetailSelect($_id: String!) {
    structureEntityDetail(_id: $_id) {
      ${STRUCTURE_ENTITY_FIELDS}
    }
  }
`;

export const STRUCTURE_ENTITY_TYPES_SELECT = gql`
  query StructureEntityTypesSelect($searchValue: String, $capability: String) {
    structureEntityTypes(searchValue: $searchValue, capability: $capability) {
      _id
      name
      code
      icon
      capabilities
      isSystem
    }
  }
`;
