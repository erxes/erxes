import { gql } from '@apollo/client';

export const CMS_POSTS_EDIT = gql`
  mutation cmsPostEdit($id: String!, $input: PostInput!) {
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
      scheduledDate
      publishedDate
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
        name
        type
        size
        duration
      }
      audio {
        url
        name
        type
        size
        duration
      }
      documents {
        url
        name
        type
        size
        duration
      }
      attachments {
        url
        name
        type
        size
        duration
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
