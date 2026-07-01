import { gql } from '@apollo/client';

export const TOGGLE_FAVORITE = gql`
  mutation toggleFavorite($path: String!) {
    toggleFavorite(path: $path) {
      _id
    }
  }
`;
