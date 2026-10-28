import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const STRUCTURE_ENTITIES_TREE = gql`
  query StructureEntitiesTree(
    $includeArchived: Boolean
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    structureEntities(
      includeArchived: $includeArchived
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        typeId
        parentId
        order
        title
        code
        status
        archivedAt
        memberCount
        seatCount
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const STRUCTURE_ENTITY_DETAIL = gql`
  query StructureEntityDetail($_id: String!) {
    structureEntityDetail(_id: $_id) {
      _id
      typeId
      parentId
      order
      title
      code
      description
      status
      archivedAt
      memberCount
      seatCount
      childCount
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
      path {
        _id
        title
        code
        location {
          coordinate {
            latitude
            longitude
          }
        }
      }
      type {
        _id
        name
        code
        icon
        capabilities
        isSystem
      }
    }
  }
`;

export const STRUCTURE_ENTITY_TYPES_LIST = gql`
  query StructureEntityTypesList {
    structureEntityTypes {
      _id
      name
      code
      description
      icon
      parentTypeIds
      capabilities
      legacyKind
      isSystem
      entityCount
    }
  }
`;

export const STRUCTURE_CAPABILITIES = gql`
  query StructureCapabilities {
    structureCapabilities {
      key
      label
      description
      plugin
    }
  }
`;
