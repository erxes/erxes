import { gql } from '@apollo/client';
export const PAGES_ADD = gql`
  mutation PagesAdd($input: PageInput!) {
    cmsPagesAdd(input: $input) {
      _id
      name
      description
      slug
      clientPortalId
      createdAt
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

export const PAGES_EDIT = gql`
  mutation PagesEdit($_id: String!, $input: PageInput!) {
    cmsPagesEdit(_id: $_id, input: $input) {
      _id
      name
      description
      slug
      clientPortalId
      createdAt
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

export const PAGES_REMOVE = gql`
  mutation PagesRemove($id: String!) {
    cmsPagesRemove(_id: $id)
  }
`;