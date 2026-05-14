import { gql } from '@apollo/client';

export const PAGE_DETAIL = gql`
  query PageDetail($id: String!) {
    cmsPage(_id: $id) {
      _id
      name
      description
      slug
      parentId
      clientPortalId
      createdAt
      status
      customFieldsData
      thumbnail {
        url
        type
        name
        __typename
      }
      pageImages {
        url
        name
        type
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
      videoUrl
      createdUser {
        _id
        email
        details {
          fullName
          firstName
          lastName
          middleName
          shortName
          avatar
          __typename
        }
        __typename
      }
      createdUserId
      updatedAt
      __typename
    }
  }
`;
