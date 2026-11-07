import { gql } from '@apollo/client';

export const CMS_CUSTOM_FIELD_GROUPS = gql`
  query cmsCustomFieldGroupList($clientPortalId: String!) {
    cmsCustomFieldGroupList(clientPortalId: $clientPortalId) {
      list {
        _id
        label
        code
        order
        clientPortalId
        customPostTypeIds
        customPostTypes {
          _id
          code
          label
          pluralLabel
        }
        enabledPageIds
        enabledCategoryIds
        enabledPostIds
        fields
      }
    }
  }
`;

export const CMS_CUSTOM_FIELD_GROUP_DETAIL = gql`
  query CmsCustomFieldGroupDetail($_id: String) {
    cmsCustomFieldGroup(_id: $_id) {
      _id
      label
      code
      order
      clientPortalId
      customPostTypeIds
      enabledPageIds
      enabledCategoryIds
      enabledPostIds
      fields
    }
  }
`;
