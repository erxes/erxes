import { gql } from '~/gql';

export const CMS_POSTIZ_DELIVERY_FIELDS = gql(`
  fragment CmsSocialDeliveryFields on CmsPostizDelivery {
    _id
    postId
    channelName
    state
    url
    message
  }
`);
export const CMS_POSTIZ_TENANT_ENABLED = gql(`
  query CmsPostizTenantEnabled {
    agentPostizTenantEnabled
  }
`);
export const CMS_POSTIZ_OPTIONS = gql(`
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
`);
export const CMS_POSTIZ_ENABLE = gql(`
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
`);
export const CMS_POSTIZ_SHARE = gql(`
  mutation CmsSocialShare($input: CmsPostizShareInput!) {
    cmsPostizShare(input: $input) {
      ...CmsSocialDeliveryFields
    }
  }
`);
export const CMS_POSTIZ_VALIDATE = gql(`
  mutation CmsSocialValidate($input: CmsPostizShareInput!) {
    cmsPostizValidate(input: $input)
  }
`);
export const CMS_POSTIZ_DELIVERIES = gql(`
  query CmsSocialDeliveries($postId: String!, $language: String!) {
    cmsPostizDeliveries(postId: $postId, language: $language) {
      ...CmsSocialDeliveryFields
    }
  }
`);
export const CMS_POSTIZ_RETRY = gql(`
  mutation CmsSocialRetry($id: String!, $reviewedInPostiz: Boolean!) {
    cmsPostizRetry(id: $id, reviewedInPostiz: $reviewedInPostiz) {
      ...CmsSocialDeliveryFields
    }
  }
`);
export const CMS_POSTIZ_REFRESH = gql(`
  mutation CmsSocialRefresh($postId: String!, $language: String!) {
    cmsPostizRefresh(postId: $postId, language: $language) {
      ...CmsSocialDeliveryFields
    }
  }
`);
