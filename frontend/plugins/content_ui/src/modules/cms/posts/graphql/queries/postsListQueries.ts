import { gql } from '@apollo/client';

export const POSTS_LIST = gql`
  query CmsPostList(
    $dateField: PostDateField
    $dateFrom: Date
    $dateTo: Date
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
  ) {
    cmsPostList(
      dateField: $dateField
      dateFrom: $dateFrom
      dateTo: $dateTo
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
    ) {
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
        status
        tagIds
        tags {
          _id
          name
        }
        featured
        featuredDate
        scheduledDate
        publishedDate
        autoArchiveDate
        reactions
        reactionCounts

        images {
          url
          name
          type
          size
          duration
        }
        video {
          url
          name
          type
          size
          duration
        }
        videoUrl
        createdAt
        updatedAt
        customFieldsData
        customFieldsMap
        author {
          ... on User {
            _id
            createdAt
            username
            email
            isActive

            links
            status
            chatStatus
            emailSignatures
            getNotificationByEmail
            onboardedPlugins
            groupIds
            isSubscribed
            isShowNotification
            propertiesData
            isOwner
            role
            permissionActions
            configs
            configsConstants
            departmentIds
            brandIds
            branchIds
            positionIds
            score
            leaderBoardPosition
            employeeId
            isOnboarded
            cursor
          }
        }
      }
      totalCount
    }
  }
`;
