import { gql } from '@apollo/client';

export const CMS_CUSTOM_FIELD_GROUPS = gql`
  query cmsCustomFieldGroupList($clientPortalId: String!) {
    cmsCustomFieldGroupList(clientPortalId: $clientPortalId) {
      list {
        _id
        label
        code
        clientPortalId
        customPostTypeIds
        customPostTypes {
          _id
          code
          label
          pluralLabel
        }
        fields
      }
    }
  }
`;
