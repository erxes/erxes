import { gql } from '@apollo/client';

export const CMS_MENU_LIST = gql`
  query cmsMenuList(
    $clientPortalId: String
    $kind: String
    $language: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
  ) {
    cmsMenuList(
      clientPortalId: $clientPortalId
      kind: $kind
      language: $language
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
    ) {
      _id
      parentId
      label
      contentType
      contentTypeId
      linkType
      kind
      icon
      url
      order
      target
      translations {
        language
      }
      __typename
    }
  }
`;
