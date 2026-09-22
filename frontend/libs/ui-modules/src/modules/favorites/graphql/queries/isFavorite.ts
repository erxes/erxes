import { gql } from '@apollo/client';

export const IS_FAVORITE = gql`
  query isFavorite($path: String!) {
    isFavorite(path: $path)
  }
`;
