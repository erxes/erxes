import { gql } from '@apollo/client';

export const GET_CUSTOMERS_EMAIL = gql`
  query customers($ids: [String]) {
    customers(ids: $ids) {
      list {
        _id
        primaryEmail
      }
    }
  }
`;

export const GET_TEAM_MEMBERS_EMAIL = gql`
  query users($ids: [String]) {
    users(ids: $ids) {
      list {
        _id
        email
      }
    }
  }
`;
