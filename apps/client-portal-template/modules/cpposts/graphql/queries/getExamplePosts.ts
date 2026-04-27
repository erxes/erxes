import { gql } from '@apollo/client';

export const GET_CP_EXAMPLE_POSTS = gql`
  query GetCPExamplePosts {
    getCPExamplePosts {
      id
      title
      content
    }
  }
`;
