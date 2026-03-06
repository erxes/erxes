import { gql } from '@apollo/client';

export const CMS_POSTS_REMOVE = gql`
  mutation CmsPostsRemove($id: String!) {
    cmsPostsRemove(_id: $id)
  }
`;

export const CMS_POSTS_REMOVE_MANY = gql`
  mutation CmsPostsRemoveMany($_ids: [String]!) {
    cmsPostsRemoveMany(_ids: $_ids)
  }
`;
