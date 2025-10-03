import { gql } from '@apollo/client';

export const TOGGLE_FAVORITE = gql`
  mutation toggleFavorite($type: String!, $path: String!) {
    toggleFavorite(type: $type, path: $path) {
      _id
    }
  }
`;
