import { gql } from '@apollo/client';

const GET_TAGS = gql`
  query CmsTags(
    $clientPortalId: String!
    $searchValue: String
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: String
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

const GET_TAGS_COUNT = gql`
query cmsTagsCount($clientPortalId: String, $searchValue: String) {
  cmsTagsCount(clientPortalId: $clientPortalId, searchValue: $searchValue)
}
`;

export default {
  GET_TAGS,
  GET_TAGS_COUNT,
};
