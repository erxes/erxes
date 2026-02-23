import { gql } from '@apollo/client';

export const CMS_TAGS_ADD = gql`
  mutation CmsTagsAdd($input: PostTagInput!) {
    cmsTagsAdd(input: $input) {
      _id
      __typename
    }
  }
`;

export const CMS_TAGS_EDIT = gql`
  mutation CmsTagsEdit($_id: String!, $input: PostTagInput!) {
    cmsTagsEdit(_id: $_id, input: $input) {
      _id
      clientPortalId
      name
      slug
      colorCode
      createdAt
      updatedAt
    }
  }
`;

export const CMS_TAGS_REMOVE = gql`
  mutation CmsTagsRemove($id: String!) {
    cmsTagsRemove(_id: $id)
  }
`;
