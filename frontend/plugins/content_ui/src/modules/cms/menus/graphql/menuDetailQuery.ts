import { gql } from '@apollo/client';

export const CMS_MENU_DETAIL = gql`
  query CmsMenuDetail($_id: String!, $clientPortalId: String!) {
    cmsMenu(_id: $_id, clientPortalId: $clientPortalId) {
      _id
      parentId
      clientPortalId
      label
      contentType
      contentTypeId
      linkType
      kind
      url
      order
      target
      translations {
        language
        title
      }
    }
  }
`;
