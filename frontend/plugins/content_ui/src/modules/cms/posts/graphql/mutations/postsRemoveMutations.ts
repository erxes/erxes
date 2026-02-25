import { gql } from '@apollo/client';

export const CMS_POSTS_REMOVE = gql`
  mutation CmsPostsRemove($id: String!) {
    cmsPostsRemove(_id: $id)
  }
`;
