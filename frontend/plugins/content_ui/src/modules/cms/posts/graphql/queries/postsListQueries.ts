import { gql } from '@apollo/client';

export const POSTS_LIST = gql`
  query CmsPostList(
    $clientPortalId: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $featured: Boolean
    $type: String
    $categoryIds: [String]
    $searchValue: String
    $status: PostStatus
    $tagIds: [String]
    $sortField: String
    $sortDirection: String
    $language: String
    $dateField: PostDateField
    $dateFrom: Date
    $dateTo: Date
  ) {
    cmsPostList(
      clientPortalId: $clientPortalId
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      featured: $featured
      type: $type
      categoryIds: $categoryIds
      searchValue: $searchValue
      status: $status
      tagIds: $tagIds
      sortField: $sortField
      sortDirection: $sortDirection
      language: $language
      dateField: $dateField
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      posts {
        _id
        type
        customPostType {
          _id
          clientPortalId
          code
          label
          pluralLabel
          description
          createdAt
        }
        authorKind
        authorId

        clientPortalId
        title
        slug
        content
        excerpt
        categoryIds
        status
        tagIds
        featured
        featuredDate
        scheduledDate
        publishedDate
        autoArchiveDate
        reactions
        reactionCounts
        videoUrl
        createdAt
        updatedAt
        categories {
          _id
          clientPortalId
          name
          slug
          description
          parentId
          status
          parent {
            _id
            clientPortalId
            name
            slug
            description
            parentId
            status
            createdAt
            updatedAt
            customFieldsData
            customFieldsMap
          }
          createdAt
          updatedAt
          customFieldsData
          customFieldsMap
        }
        customFieldsData
        customFieldsMap
        tags {
          _id
          clientPortalId
          name
          slug
          colorCode
          createdAt
          updatedAt
        }
      }
      totalCount
    }
  }
`;
