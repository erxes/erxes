import { gql } from '~/gql';

export const CMS_CUSTOM_POST_TYPE_EDIT = gql(`
  mutation cmsCustomPostTypesEdit($_id: String!, $input: CustomPostTypeInput!) {
    cmsCustomPostTypesEdit(_id: $_id, input: $input) {
      _id
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`);

export const CMS_CUSTOM_POST_TYPE_REMOVE = gql(`
  mutation cmsCustomPostTypesRemove($_id: String!) {
    cmsCustomPostTypesRemove(_id: $_id)
  }
`);
