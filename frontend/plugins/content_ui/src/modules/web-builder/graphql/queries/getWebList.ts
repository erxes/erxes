import { gql } from '@apollo/client';

export const GET_WEB_LIST = gql`
  query GetWebList {
    getWebList {
      _id
      name
      description
      domain
      templateType
      templateId
      clientPortalId
      thumbnail {
        url
        name
        type
        size
        duration
      }
    }
  }
`;
