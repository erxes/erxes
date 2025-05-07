import { gql } from '@apollo/client';

const ADD = gql`
  mutation CmsCustomFieldGroupsAdd($input: CustomFieldGroupInput!) {
    cmsCustomFieldGroupsAdd(input: $input) {
      _id
      clientPortalId
      code
      createdAt
      label
    }
  }
`;

const EDIT = gql`
  mutation CmsCustomFieldGroupsEdit(
    $id: String!
    $input: CustomFieldGroupInput!
  ) {
    cmsCustomFieldGroupsEdit(_id: $id, input: $input) {
      _id
      clientPortalId
      code
      createdAt
      label
    }
  }
`;

const REMOVE = gql`
  mutation CmsCustomFieldGroupsRemove($id: String!) {
    cmsCustomFieldGroupsRemove(_id: $id)
  }
`;

const ADD_FIELD = gql`
  mutation fieldsAdd(
    $contentType: String!
    $type: String
    $validation: String
    $regexValidation: String
    $text: String
    $description: String
    $options: [String]
    $locationOptions: [LocationOptionInput]
    $isRequired: Boolean
    $order: Int
    $groupId: String
    $code: String
  ) {
    fieldsAdd(
      contentType: $contentType
      type: $type
      validation: $validation
      regexValidation: $regexValidation
      text: $text
      description: $description
      options: $options
      locationOptions: $locationOptions
      isRequired: $isRequired
      order: $order
      groupId: $groupId
      code: $code
    ) {
      _id
      
    }
  }
`;

const EDIT_FIELD = gql`
  mutation fieldsEdit(
    $_id: String!
    $type: String
    $validation: String
    $regexValidation: String
    $text: String
    $description: String
    $options: [String]
    $locationOptions: [LocationOptionInput]
    $isRequired: Boolean
    $order: Int
    $groupId: String
    $code: String
  ) {
    fieldsEdit(
      _id: $_id
      type: $type
      validation: $validation
      regexValidation: $regexValidation
      text: $text
      description: $description
      options: $options
      locationOptions: $locationOptions
      isRequired: $isRequired
      order: $order
      groupId: $groupId
      code: $code
    ) {
      _id
      
    }
  }
`;

const REMOVE_FIELD = gql`
  mutation fieldsRemove($id: String!) {
    fieldsRemove(_id: $id) {
      _id
    }
  }
`;
    

export default {
  ADD,
  EDIT,
  REMOVE,

  ADD_FIELD,
  EDIT_FIELD,
  REMOVE_FIELD
};
