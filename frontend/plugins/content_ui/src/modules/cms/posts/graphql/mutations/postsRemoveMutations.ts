import { gql } from '@apollo/client';

export const CMS_POSTS_REMOVE = gql`
  mutation cmsPostRemove($id: String!) {
    cmsPostsRemove(_id: $id)
  }
`;

export const CMS_POSTS_REMOVE_MANY = gql`
  mutation cmsPostRemoveMany($_ids: [String]!) {
    cmsPostsRemoveMany(_ids: $_ids)
  }
`;
