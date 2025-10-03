import { gql } from '@apollo/client';

export const IS_FAVORITE = gql`
  query isFavorite($type: String!, $path: String!) {
    isFavorite(type: $type, path: $path)
  }
`;
