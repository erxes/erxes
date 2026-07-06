import { gql } from '@apollo/client';

export const TOGGLE_FAVORITE = gql`
  mutation toggleFavorite($path: String!, $breadcrumb: [String!]) {
    toggleFavorite(path: $path, breadcrumb: $breadcrumb) {
      _id
    }
  }
`;
