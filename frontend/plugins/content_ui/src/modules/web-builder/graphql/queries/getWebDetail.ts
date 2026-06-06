import { gql } from '@apollo/client';

export const GET_WEB_DETAIL = gql`
  query GetWebDetail($_id: String!) {
    getWebDetail(_id: $_id) {
      _id
      name
      description
      domain
      createdAt
      url
    }
  }
`;
