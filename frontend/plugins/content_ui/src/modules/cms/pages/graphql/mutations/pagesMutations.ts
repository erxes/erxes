import { gql } from '@apollo/client';
export const PAGES_ADD = gql`
  mutation PagesAdd($input: PageInput!) {
    cmsPagesAdd(input: $input) {
      _id
      name
      parentId
      description
      slug
      content
      coverImage
      status
      clientPortalId
      createdAt
      customFieldsData
      thumbnail {
        url
        name
        type
        __typename
      }
      pageImages {
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
        __typename
      }
      audio {
        url
        name
        type
        __typename
      }
      documents {
        url
        name
        type
        __typename
      }
      attachments {
        url
        name
        type
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

export const PAGES_EDIT = gql`
  mutation PagesEdit($_id: String!, $input: PageInput!) {
    cmsPagesEdit(_id: $_id, input: $input) {
      _id
      name
      parentId
      description
      slug
      content
      coverImage
      status
      clientPortalId
      createdAt
      customFieldsData
      thumbnail {
        url
        name
        type
        __typename
      }
      pageImages {
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
        __typename
      }
      audio {
        url
        name
        type
        __typename
      }
      documents {
        url
        name
        type
        __typename
      }
      attachments {
        url
        name
        type
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

export const PAGES_REMOVE = gql`
  mutation PagesRemove($id: String!) {
    cmsPagesRemove(_id: $id)
  }
`;
