import { gql } from '@apollo/client';

const GET_CATEGORIES = gql`
  query CmsCategories(
    $clientPortalId: String!
    $searchValue: String
    $status: CategoryStatus
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: String
  ) {
    cmsCategories(
      clientPortalId: $clientPortalId
      searchValue: $searchValue
      status: $status
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      clientPortalId
      createdAt
      description
      name
      slug
      status
      customFieldsData
      
      parent {
        _id
        name
        slug
        status
      }
      parentId
    }
  }
`;

const GET_CATEGORIES_COUNT = gql`
query cmsCategoriesCount($clientPortalId: String, $searchValue: String, $status: CategoryStatus) {
  cmsCategoriesCount(clientPortalId: $clientPortalId, searchValue: $searchValue, status: $status)
}
`;

export default {
  GET_CATEGORIES,
  GET_CATEGORIES_COUNT,
};
