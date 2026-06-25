import { gql } from '@apollo/client';

export const CLIENT_PORTAL_REMOVE = gql`
  mutation ClientPortalRemove($_id: String!) {
    clientPortalRemove(_id: $_id)
  }
`;

export const ARTICLES = gql`
  query knowledgeBaseArticles(
    $limit: Int
    $cursor: String
    $direction: String
    $categoryIds: [String]
  ) {
    knowledgeBaseArticles(
      limit: $limit
      cursor: $cursor
      direction: $direction
      categoryIds: $categoryIds
    ) {
      list {
        _id
        title
        code
        summary
        content
        status
        categoryId
        createdDate
        modifiedDate
        createdUser {
          _id
          username
          email
        }
        publishedUser {
          _id
          username
          email
          details {
            avatar
            fullName
          }
        }
        createdBy
        modifiedBy
        tags
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      totalCount
    }
  }
`;

export const POST_LIST = gql`
  query PostList(
    $clientPortalId: String!
    $type: String
    $featured: Boolean
    $searchValue: String
    $status: PostStatus
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $tagIds: [String]
    $sortField: String
    $sortDirection: String
  ) {
    cmsPostList(
      clientPortalId: $clientPortalId
      featured: $featured
      type: $type
      searchValue: $searchValue
      status: $status
      limit: $limit
      cursor: $cursor
      direction: $direction
      tagIds: $tagIds
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      posts {
        _id
        type
        customPostType {
          _id
          code
          label
          __typename
        }
        authorKind
        author {
          ... on User {
            username
            email
            details {
              fullName
              shortName
              avatar
              firstName
              lastName
              middleName
              __typename
            }
            __typename
          }
          # Remove or replace the ClientPortalUser fragment if not needed
          __typename
        }
        featured
        status
        tagIds
        # Remove or replace the tags field if not available
        authorId
        createdAt
        autoArchiveDate
        scheduledDate
        excerpt
        thumbnail {
          url
          __typename
        }
        title
        updatedAt
        __typename
      }
      __typename
    }
  }
`;

export const POSTS_ADD = gql`
  mutation PostsAdd($input: PostInput!) {
    cmsPostsAdd(input: $input) {
      _id
      count
      slug
      __typename
    }
  }
`;

export const CMS_POSTS_EDIT = gql`
  mutation CmsPostsEdit($id: String!, $input: PostInput!) {
    cmsPostsEdit(_id: $id, input: $input) {
      _id
      type
      customPostType {
        _id
        code
        label
        __typename
      }
      authorKind
      authorId
      author {
        ... on User {
          userId: _id
          username
          email
          details {
            fullName
            shortName
            avatar
            firstName
            lastName
            middleName
            __typename
          }
          __typename
        }
        __typename
      }
      clientPortalId
      title
      count
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      featured
      featuredDate
      publishedDate
      scheduledDate
      autoArchiveDate
      reactions
      reactionCounts
      thumbnail {
        url
        type
        name
        __typename
      }
      images {
        url
        name
        type
        size
        duration
      }
      video {
        url
        type
        name
        __typename
      }
      audio {
        url
        type
        name
        __typename
      }
      documents {
        url
        type
        name
        __typename
      }
      attachments {
        url
        type
        name
        __typename
      }
      pdfAttachment {
        pdf {
          url
          name
          type
          size
          duration
        }
        pages {
          url
          name
          type
          size
          duration
        }
      }
      videoUrl
      createdAt
      updatedAt
      categories {
        _id
        name
        slug
        __typename
      }
      customFieldsData
      customFieldsMap
      __typename
    }
  }
`;

export const CMS_POST = gql`
  query Post($id: String) {
    cmsPost(_id: $id) {
      _id
      type
      clientPortalId
      title
      count
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      authorId
      featured
      featuredDate
      publishedDate
      scheduledDate
      autoArchiveDate
      reactions
      reactionCounts
      thumbnail {
        url
        type
        name
        __typename
      }
      images {
        url
        type
        name
        __typename
      }
      video {
        url
        type
        name
        __typename
      }
      audio {
        url
        type
        name
        __typename
      }
      documents {
        url
        type
        name
        __typename
      }
      attachments {
        url
        type
        name
        __typename
      }
      pdfAttachment {
        pages {
          url
          name
          type
          size
          duration
          __typename
        }
        __typename
      }
      videoUrl
      createdAt
      updatedAt
      authorKind
      author {
        ... on User {
          userId: _id
          username
          email
          details {
            fullName
            shortName
            avatar
            firstName
            lastName
            middleName
            __typename
          }
          __typename
        }
        __typename
      }
      categories {
        _id
        name
        slug
        __typename
      }
      customFieldsData
      __typename
    }
  }
`;

export const CMS_POSTS_REMOVE = gql`
  mutation CmsPostsRemove($id: String!) {
    cmsPostsRemove(_id: $id)
  }
`;
