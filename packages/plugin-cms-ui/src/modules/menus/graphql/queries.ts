import { gql } from '@apollo/client';

export const menuList = gql`
  query cmsMenuList($clientPortalId: String, $kind: String) {
    cmsMenuList(clientPortalId: $clientPortalId, kind: $kind) {
      _id
      parentId
      label
      contentType
      contentTypeID
      kind
      icon
      url
      order
      target
    }
  }
`;

export const menuDetail = gql`
  query cmsMenuDetail($_id: String!) {
    cmsMenu(_id: $_id) {
      _id
      parentId
      label
      contentType
      contentTypeID
      kind
      icon
      url
      order
      target
    }
  }
`;
