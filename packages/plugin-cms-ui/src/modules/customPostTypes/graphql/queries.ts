import { gql } from '@apollo/client';


const LIST = gql`
  query CmsCustomPostTypeList(
    $clientPortalId: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    cmsCustomPostTypeList(
      clientPortalId: $clientPortalId
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      currentPage
      list {
        _id
        code
        createdAt
        description
        label
        pluralLabel
      }
      totalCount
      totalPages
    }
  }
`;

const CUSTOM_TYPES = gql`
  query CmsCustomPostTypes($clientPortalId: String, $page: Int, $perPage: Int) {
    cmsCustomPostTypes(
      clientPortalId: $clientPortalId
      page: $page
      perPage: $perPage
    ) {
      _id
      label
      code
    }
  }
`;

export default {
  LIST,
  CUSTOM_TYPES
}