import { gql } from '@apollo/client';

export const TOGGLE_FAVORITE = gql`
  mutation toggleFavorite($path: String!, $breadcrumb: [String!], $icon: String) {
    toggleFavorite(path: $path, breadcrumb: $breadcrumb, icon: $icon) {
      _id
    }
  }
`;
