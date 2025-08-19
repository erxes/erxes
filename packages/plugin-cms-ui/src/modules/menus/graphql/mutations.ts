import { gql } from '@apollo/client';

const commonParams = `
  $parentId: String
  $clientPortalId: String
  $label: String
  $contentType: String
  $contentTypeID: String
  $kind: String
  $icon: String
  $url: String
  $order: Int
  $target: String
`;

const commonVariables = `
  parentId: $parentId
  clientPortalId: $clientPortalId
  label: $label
  contentType: $contentType
  contentTypeID: $contentTypeID
  kind: $kind
  icon: $icon
  url: $url
  order: $order
  target: $target
`;

export const ADD_MENU = gql`
  mutation cmsAddMenu(${commonParams}) {
    cmsAddMenu(
      input: {
        ${commonVariables}
      }
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
  mutation cmsEditMenu($_id: String!, ${commonParams}) {
    cmsEditMenu(
      _id: $_id,
      input: {
        ${commonVariables}
      }
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
