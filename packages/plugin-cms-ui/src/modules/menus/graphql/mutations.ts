import { gql } from '@apollo/client';

export const ADD_MENU = gql`
  mutation cmsAddMenu($input: MenuItemInput!) {
    cmsAddMenu(
      input: $input
    ) {
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

export const EDIT_MENU = gql`
  mutation cmsEditMenu($_id: String!, $input: MenuItemInput!) {
    cmsEditMenu(
      _id: $_id,
      input: $input
    ) {
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

export const REMOVE_MENU = gql`
  mutation cmsRemoveMenu($_id: String!) {
    cmsRemoveMenu(_id: $_id)
  }
`;
