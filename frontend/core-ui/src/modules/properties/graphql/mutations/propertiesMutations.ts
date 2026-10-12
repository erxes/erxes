import { gql } from '@apollo/client';
import { PROPERTY_SYSTEM_FIELD_SELECTION } from '../queries/propertiesQueries';

export const FIELD_GROUP_EDIT = gql`
  mutation FieldGroupEdit(
    $id: String!
    $order: Float
    $name: String
    $code: String
    $description: String
    $contentType: String
    $logics: JSON
    $configs: JSON
  ) {
    fieldGroupEdit(
      _id: $id
      order: $order
      name: $name
      code: $code
      description: $description
      contentType: $contentType
      logics: $logics
      configs: $configs
    ) {
      _id
    }
  }
`;

export const FIELD_GROUPS_UPDATE_ORDER = gql`
  mutation propertiesFieldGroupsUpdateOrder($orders: [FieldGroupOrderItem!]!) {
    fieldGroupsUpdateOrder(orders: $orders) {
      _id
      order
    }
  }
`;

export const FIELD_EDIT = gql`
  mutation FieldEdit(
    $id: String!
    $order: Float
    $code: String
    $name: String
    $groupId: String
    $contentType: String
    $type: String
    $options: [FieldOptionInput]
    $validations: JSON
    $logics: JSON
    $configs: JSON
    $icon: String
    $isVisible: Boolean
    $isVisibleToCreate: Boolean
    $isRequired: Boolean
    $isVisibleInCard: Boolean
  ) {
    fieldEdit(
      _id: $id
      order: $order
      code: $code
      name: $name
      groupId: $groupId
      contentType: $contentType
      type: $type
      options: $options
      validations: $validations
      logics: $logics
      configs: $configs
      icon: $icon
      isVisible: $isVisible
      isVisibleToCreate: $isVisibleToCreate
      isRequired: $isRequired
      isVisibleInCard: $isVisibleInCard
    ) {
      _id
      isVisible
      isVisibleToCreate
      isRequired
      isVisibleInCard
    }
  }
`;

export const PROPERTY_SYSTEM_FIELD_EDIT = gql`
  mutation PropertySystemFieldEdit(
    $contentType: String!
    $code: String!
    $isVisible: Boolean
    $isVisibleToCreate: Boolean
    $isRequired: Boolean
    $logics: [PropertySystemFieldLogicInput!]
  ) {
    propertySystemFieldEdit(
      contentType: $contentType
      code: $code
      isVisible: $isVisible
      isVisibleToCreate: $isVisibleToCreate
      isRequired: $isRequired
      logics: $logics
    ) {
      ${PROPERTY_SYSTEM_FIELD_SELECTION}
    }
  }
`;

export const PROPERTY_SYSTEM_FIELDS_LAYOUT_SAVE = gql`
  mutation PropertySystemFieldsLayoutSave(
    $contentType: String!
    $layout: [[String!]!]
  ) {
    propertySystemFieldsLayoutSave(contentType: $contentType, layout: $layout)
  }
`;

export const FIELDS_ARCHIVE = gql`
  mutation FieldsArchive($ids: [String!]!) {
    fieldsArchive(_ids: $ids)
  }
`;

export const FIELD_RESTORE = gql`
  mutation FieldRestore($id: String!) {
    fieldRestore(_id: $id) {
      _id
      archivedAt
    }
  }
`;

export const FIELD_GROUP_ARCHIVE = gql`
  mutation FieldGroupArchive($id: String!) {
    fieldGroupArchive(_id: $id) {
      _id
      archivedAt
    }
  }
`;

export const FIELD_GROUP_RESTORE = gql`
  mutation FieldGroupRestore($id: String!) {
    fieldGroupRestore(_id: $id) {
      _id
      archivedAt
    }
  }
`;

export const FIELDS_REMOVE = gql`
  mutation FieldsRemove($ids: [String!]!) {
    fieldsRemove(_ids: $ids)
  }
`;

export const FIELD_GROUP_REMOVE = gql`
  mutation FieldGroupRemove($id: String!) {
    fieldGroupRemove(_id: $id) {
      _id
    }
  }
`;
