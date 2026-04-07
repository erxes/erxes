import { gql } from '@apollo/client';

export const CMS_CUSTOM_FIELD_GROUP_ADD = gql`
  mutation cmsCustomFieldGroupsAdd($input: CustomFieldGroupInput!) {
    cmsCustomFieldGroupsAdd(input: $input) {
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
`;

export const CMS_CUSTOM_FIELD_GROUP_EDIT = gql`
  mutation cmsCustomFieldGroupsEdit(
    $_id: String!
    $input: CustomFieldGroupInput!
  ) {
    cmsCustomFieldGroupsEdit(_id: $_id, input: $input) {
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
`;

export const CMS_CUSTOM_FIELD_GROUP_REMOVE = gql`
  mutation cmsCustomFieldGroupsRemove($_id: String!) {
    cmsCustomFieldGroupsRemove(_id: $_id)
  }
`;

export const CMS_AI_SUGGEST_FIELDS = gql`
  mutation CmsAiSuggestFields($prompt: String!, $clientPortalId: String) {
    cmsAiSuggestFields(prompt: $prompt, clientPortalId: $clientPortalId) {
      groupLabelSuggestion
      customPostTypeSuggestion
      fields {
        label
        code
        type
        description
        isRequired
        options
      }
    }
  }
`;