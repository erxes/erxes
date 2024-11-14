import { gql } from '@apollo/client';

const POST_LIST = gql`
  query PostList(
    $clientPortalId: String!
    $featured: Boolean
    $categoryId: String
    $searchValue: String
    $status: PostStatus
    $page: Int
    $perPage: Int
    $tagIds: [String]
    $sortField: String
    $sortDirection: SortDirection
  ) {
    postList(
      clientPortalId: $clientPortalId
      featured: $featured
      categoryId: $categoryId
      searchValue: $searchValue
      status: $status
      page: $page
      perPage: $perPage
      tagIds: $tagIds
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      currentPage
      totalCount
      totalPages
      posts {
        _id
        author {
          _id
          email
          details {
            fullName
            firstName
            shortName
            lastName
          }
          username
        }
        categoryIds
        categories {
          _id
          name
        }
        featured
        status
        tagIds
        tags {
          _id
          name
        }
        authorId
        createdAt
        autoArchiveDate
        scheduledDate
        thumbnail {
          url
        }
        title
        updatedAt
      }
    }
  }
`;

export default {
  POST_LIST,
};
