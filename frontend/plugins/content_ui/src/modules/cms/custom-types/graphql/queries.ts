import { gql } from '@apollo/client';

export const CMS_CUSTOM_POST_TYPES = gql`
  query cmsCustomPostTypes($clientPortalId: String) {
    cmsCustomPostTypes(clientPortalId: $clientPortalId) {
      _id
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`;

export const CMS_CUSTOM_POST_TYPE_DETAIL = gql`
  query CmsCustomPostTypeDetail($_id: String) {
    cmsCustomPostType(_id: $_id) {
      _id
      clientPortalId
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`;
