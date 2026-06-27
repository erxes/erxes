import { gql } from '@apollo/client';

export const CMS_POSTS_ADD = gql`
  mutation cmsPostCreate($input: PostInput!) {
    cmsPostsAdd(input: $input) {
      _id
      count
      slug
      __typename
    }
  }
`;
