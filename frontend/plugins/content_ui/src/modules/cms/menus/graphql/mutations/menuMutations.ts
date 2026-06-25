import { gql } from '@apollo/client';

export const CMS_MENU_ADD = gql`
  mutation cmsAddMenu($input: MenuItemInput!) {
    cmsAddMenu(input: $input) {
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
      __typename
    }
  }
`;

export const CMS_MENU_EDIT = gql`
  mutation cmsEditMenu($_id: String!, $input: MenuItemInput!) {
    cmsEditMenu(_id: $_id, input: $input) {
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
      __typename
    }
  }
`;

export const CMS_MENU_REMOVE = gql`
  mutation cmsRemoveMenu($_id: String!) {
    cmsRemoveMenu(_id: $_id)
  }
`;
