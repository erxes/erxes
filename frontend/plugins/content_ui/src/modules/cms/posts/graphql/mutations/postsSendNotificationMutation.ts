import { gql } from '~/gql';

export const CMS_POSTS_SEND_NOTIFICATION = gql(`
  mutation CmsPostsSendNotification($id: String!) {
    cmsPostsSendNotification(_id: $id)
  }
`);
