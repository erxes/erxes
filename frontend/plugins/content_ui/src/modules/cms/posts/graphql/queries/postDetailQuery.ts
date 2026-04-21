import { gql } from '@apollo/client';

export const POST_DETAIL = gql`
  query PostDetail($id: String!) {
    cmsPost(_id: $id) {
      _id
      title
      slug
      content
      status
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
        __typename
      }
      featured
      status
      tagIds
      categoryIds
      authorId
      createdAt
      updatedAt
      scheduledDate
      autoArchiveDate
      excerpt
      thumbnail {
        url
        name
        __typename
      }
      images {
        url
        name
        __typename
      }
      video {
        url
        name
        __typename
      }
      audio {
        url
        name
        __typename
      }
      documents {
        url
        name
        __typename
      }
      attachments {
        url
        name
        __typename
      }
      pdfAttachment {
        pdf {
          url
          name
          __typename
        }
        __typename
      }
      customFieldsData
      __typename
    }
  }
`;
