import { gql } from '@apollo/client';

const LIST = gql`
  query CmsCustomFieldGroups(
    $clientPortalId: String!
    $page: Int
    $perPage: Int
  ) {
    cmsCustomFieldGroups(
      clientPortalId: $clientPortalId
      page: $page
      perPage: $perPage
    ) {
      _id
      clientPortalId
      code
      label
      order
      parentId
      createdAt
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
