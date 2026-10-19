import { gql } from '~/gql';

export const CMS_POSTS_DUPLICATE = gql(`
  mutation CmsPostsDuplicate($_id: String!) {
    cmsPostsDuplicate(_id: $_id) {
      _id
      title
      slug
      status
    }
  }
`);
