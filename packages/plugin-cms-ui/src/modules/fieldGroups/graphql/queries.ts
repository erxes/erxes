import { gql } from '@apollo/client';

const LIST = gql`
  query CmsCustomFieldGroups(
    $clientPortalId: String!
    $page: Int
    $perPage: Int
    $postType: String
    $pageId: String
    $categoryId: String
  ) {
    cmsCustomFieldGroups(
      clientPortalId: $clientPortalId
      page: $page
      perPage: $perPage
      postType: $postType
      pageId: $pageId
      categoryId: $categoryId
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

      enabledCategoryIds
      enabledPageIds
    }
  }
`;

export default {
  LIST,
};
