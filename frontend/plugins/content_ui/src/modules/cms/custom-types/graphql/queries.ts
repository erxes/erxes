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
