import { gql } from '@apollo/client';

export const FIELD_GROUP_ADD = gql`
  mutation FieldGroupAdd(
    $name: String
    $code: String
    $contentType: String
    $logics: JSON
    $configs: JSON
  ) {
    fieldGroupAdd(
      name: $name
      code: $code
      contentType: $contentType
      logics: $logics
      configs: $configs
    ) {
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
    $configs: JSON
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
      configs: $configs
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
