import { gql } from '~/gql';

export const CMS_TAG_DETAIL = gql(`
  query CmsTagDetail($_id: String!, $clientPortalId: String) {
    cmsTag(_id: $_id, clientPortalId: $clientPortalId) {
      _id
      clientPortalId
      name
      slug
      colorCode
      createdAt
      updatedAt
      translations {
        language
        title
      }
    }
  }
`);
