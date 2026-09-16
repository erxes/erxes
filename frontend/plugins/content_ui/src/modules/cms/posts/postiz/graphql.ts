import { gql } from '@apollo/client';

export interface PostizChannel {
  id: string;
  name: string;
  provider: string;
  usable: boolean;
}
export interface PostizOptions {
  enabled: boolean;
  canManage: boolean;
  channels: PostizChannel[];
}
export interface PostizDelivery {
  _id: string;
  postId: string;
  channelName: string;
  state: string;
  url?: string | null;
  message?: string | null;
}
export interface PostizShareInput {
  postId: string;
  requestId: string;
  language: string;
  channelIds: string[];
  caption: string;
  media: string[];
}

const deliveryFields = gql`
  fragment CmsSocialDeliveryFields on CmsPostizDelivery {
    _id
    postId
    channelName
    state
    url
    message
  }
`;
export const CMS_POSTIZ_OPTIONS = gql`
  query CmsSocialOptions($clientPortalId: String!, $language: String) {
    cmsPostizOptions(clientPortalId: $clientPortalId, language: $language) {
      enabled
      canManage
      channels {
        id
        name
        provider
        usable
      }
    }
  }
`;
export const CMS_POSTIZ_ENABLE = gql`
  mutation CmsSocialEnable(
    $clientPortalId: String!
    $language: String!
    $enabled: Boolean!
  ) {
    cmsPostizEnable(
      clientPortalId: $clientPortalId
      language: $language
      enabled: $enabled
    )
  }
`;
export const CMS_POSTIZ_SHARE = gql`
  mutation CmsSocialShare($input: CmsPostizShareInput!) {
    cmsPostizShare(input: $input) {
      ...CmsSocialDeliveryFields
    }
  }
  ${deliveryFields}
`;
export const CMS_POSTIZ_VALIDATE = gql`
  mutation CmsSocialValidate($input: CmsPostizShareInput!) {
    cmsPostizValidate(input: $input)
  }
`;
export const CMS_POSTIZ_DELIVERIES = gql`
  query CmsSocialDeliveries($postId: String!, $language: String!) {
    cmsPostizDeliveries(postId: $postId, language: $language) {
      ...CmsSocialDeliveryFields
    }
  }
  ${deliveryFields}
`;
export const CMS_POSTIZ_RETRY = gql`
  mutation CmsSocialRetry($id: String!, $reviewedInPostiz: Boolean!) {
    cmsPostizRetry(id: $id, reviewedInPostiz: $reviewedInPostiz) {
      ...CmsSocialDeliveryFields
    }
  }
  ${deliveryFields}
`;
