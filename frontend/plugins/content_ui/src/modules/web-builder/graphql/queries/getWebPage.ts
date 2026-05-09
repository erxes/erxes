import { gql } from '@apollo/client';

export const GET_WEB_PAGE = gql`
  query GetWebPage($_id: String!) {
    getWebPage(_id: $_id) {
      _id
      webId
      clientPortalId
      name
      slug
      description
      coverImage
      createdAt
      updatedAt
      pageItems {
        _id
        name
        type
        content
        order
        contentType
        contentTypeId
        config
      }
    }
  }
`;
