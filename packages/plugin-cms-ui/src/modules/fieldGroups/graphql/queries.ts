import { gql } from '@apollo/client';

const LIST = gql`
  query CmsCustomFieldGroups(
    $clientPortalId: String!
    $page: Int
    $perPage: Int
    $postType: String
  ) {
    cmsCustomFieldGroups(
      clientPortalId: $clientPortalId
      page: $page
      perPage: $perPage
      postType: $postType
    ) {
      _id
      clientPortalId
      code
      label
      order
      parentId
      createdAt
      customPostTypeIds
      customPostTypes {
        _id
        label
      }
      fields {
        _id
        code
        text
        type
        validation
        order
        options
        optionsValues
      }
    }
  }
`;

export default {
  LIST,
};
