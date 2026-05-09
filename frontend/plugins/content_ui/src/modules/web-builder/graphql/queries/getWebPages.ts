import { gql } from '@apollo/client';

export const GET_WEB_PAGES = gql`
  query GetWebPages($webId: String!, $searchValue: String) {
    getWebPages(webId: $webId, searchValue: $searchValue) {
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
