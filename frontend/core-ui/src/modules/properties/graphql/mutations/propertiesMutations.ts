import { gql } from '@apollo/client';

export const FIELD_GROUP_ADD = gql`
  mutation FieldGroupAdd(
    $name: String
    $code: String
    $contentType: String
    $logics: JSON
  ) {
    fieldGroupAdd(
      name: $name
      code: $code
      contentType: $contentType
      logics: $logics
    ) {
      _id
    }
  }
`;

export const FIELD_GROUP_EDIT = gql`
  mutation FieldGroupEdit(
    $id: String!
    $order: Float
    $name: String
    $code: String
    $description: String
    $contentType: String
    $logics: JSON
  ) {
    fieldGroupEdit(
      _id: $id
      order: $order
      name: $name
      code: $code
      description: $description
      contentType: $contentType
      logics: $logics
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

export const FIELD_GROUP_REMOVE = gql`
  mutation FieldGroupRemove($id: String!) {
    fieldGroupRemove(_id: $id) {
      _id
    }
  }
`;

export const FIELD_ADD = gql`
  mutation FieldAdd(
    $name: String
    $code: String
    $groupId: String
    $contentType: String
    $type: String
    $options: [FieldOptionInput]
    $validations: JSON
    $logics: JSON
    $icon: String
    $isVisible: Boolean
    $isVisibleToCreate: Boolean
    $isRequired: Boolean
    $isVisibleInCard: Boolean
  ) {
    fieldAdd(
      name: $name
      code: $code
      groupId: $groupId
      contentType: $contentType
      type: $type
      options: $options
      validations: $validations
      logics: $logics
      icon: $icon
      isVisible: $isVisible
      isVisibleToCreate: $isVisibleToCreate
      isRequired: $isRequired
      isVisibleInCard: $isVisibleInCard
    ) {
      _id
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

export const FIELD_REMOVE = gql`
  mutation FieldRemove($id: String!) {
    fieldRemove(_id: $id) {
      _id
    }
  }
`;
