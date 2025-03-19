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

export default {
  ADD,
  EDIT,
  REMOVE,
};
