import { gql } from '@apollo/client';

export const CREATE_AMENITY = gql`
  mutation BmsElementAdd(
    $name: String
    $icon: String
    $quick: Boolean
    $branchId: String
  ) {
    bmsElementAdd(
      name: $name
      icon: $icon
      quick: $quick
      branchId: $branchId
    ) {
      _id
    }
  }
`;

export const EDIT_AMENITY = gql`
  mutation BmsElementEdit(
    $id: String!
    $name: String
    $icon: String
    $quick: Boolean
  ) {
    bmsElementEdit(
      _id: $id
      name: $name
      icon: $icon
      quick: $quick
    ) {
      _id
    }
  }
`;

export const REMOVE_AMENITY = gql`
  mutation BmsElementRemove($ids: [String]) {
    bmsElementRemove(ids: $ids)
  }
`;
