import { gql } from '@apollo/client';

export const GET_FAVORITES = gql`
  query getFavoritesByCurrentUser {
    getFavoritesByCurrentUser {
      _id
      type
      path
    }
  }
`;
