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
    $sortDirection: String
  ) {
    cmsPostList(
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
        authorKind
        author {
          ... on User {
            _id
            username
            email
            details {
              fullName
              shortName
              avatar
              firstName
              lastName
              middleName
            }
          }
          ... on ClientPortalUser {
            _id
            fullName
            firstName
            lastName
            email
            username
            customer {
              avatar
            }
          }
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

const POST = gql`
  query Post($id: String) {
    cmsPost(_id: $id) {
      _id
      clientPortalId
      title
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      authorId
      featured
      featuredDate
      scheduledDate
      autoArchiveDate
      reactions
      reactionCounts
      thumbnail {
        url
        type
        name
      }
      images {
        url
        type
        name
      }
      video {
        url
        type
        name
      }
      audio {
        url
        type
        name
      }
      documents {
        url
        type
        name
      }
      attachments {
        url
        type
        name
      }
      pdfAttachment {
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
      authorKind
      author {
        ... on User {
          _id
          username
          email
          details {
            fullName
            shortName
            avatar
            firstName
            lastName
            middleName
          }
        }
        ... on ClientPortalUser {
          _id
          fullName
          firstName
          lastName
          email
          username
          customer {
            avatar
          }
        }
      }
      categories {
        _id
        name
        slug
      }
      tags {
        _id
        name
      }
      customFieldsData
    }
  }
`;



export default {
  POST_LIST,
  POST,
};
