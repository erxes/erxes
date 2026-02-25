import { gql } from '@apollo/client';

export const PAGE_DETAIL = gql`
  query PageDetail($id: String!) {
    cmsPageDetail(_id: $id) {
      _id
      name
      description
      slug
      clientPortalId
      createdAt
      status
      customFieldsData
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