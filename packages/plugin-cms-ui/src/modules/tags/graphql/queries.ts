import { gql } from '@apollo/client';

const GET_TAGS = gql`
  query CmsTags(
    $clientPortalId: String!
    $searchValue: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: SortDirection
  ) {
    cmsTags(
      clientPortalId: $clientPortalId
      searchValue: $searchValue
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      clientPortalId
      name
      slug
      colorCode
      createdAt
      updatedAt
    }
  }
`;

export default {
  GET_TAGS,
};
