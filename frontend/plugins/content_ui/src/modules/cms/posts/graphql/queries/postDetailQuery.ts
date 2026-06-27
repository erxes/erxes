import { gql } from '@apollo/client';

export const POST_DETAIL = gql`
  query cmsPostDetail($id: String!) {
    cmsPost(_id: $id) {
      _id
      type
      customPostType {
        _id
        code
        label
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
      authorId
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
        __typename
      }
      video {
        url
        name
        type
        size
        duration
        __typename
      }
      audio {
        url
        name
        type
        size
        duration
        __typename
      }
      documents {
        url
        name
        type
        size
        duration
        __typename
      }
      attachments {
        url
        name
        type
        size
        duration
        __typename
      }
      pdfAttachment {
        pdf {
          url
          name
          type
          size
          duration
          __typename
        }
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
      categories {
        _id
        name
        slug
        __typename
      }
      tags {
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
