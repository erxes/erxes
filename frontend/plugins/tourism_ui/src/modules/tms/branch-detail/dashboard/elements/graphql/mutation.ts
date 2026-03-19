import { gql } from '@apollo/client';

export const CREATE_ELEMENT = gql`
  mutation BmsElementAdd(
    $name: String
    $note: String
    $startTime: String
    $duration: Int
    $cost: Float
    $categories: [String]
    $quick: Boolean
    $branchId: String
  ) {
    bmsElementAdd(
      name: $name
      note: $note
      startTime: $startTime
      duration: $duration
      cost: $cost
      categories: $categories
      quick: $quick
      branchId: $branchId
    ) {
      _id
    }
  }
`;

export const EDIT_ELEMENT = gql`
  mutation BmsElementEdit(
    $id: String!
    $name: String
    $note: String
    $startTime: String
    $duration: Int
    $cost: Float
    $categories: [String]
    $quick: Boolean
  ) {
    bmsElementEdit(
      _id: $id
      name: $name
      note: $note
      startTime: $startTime
      duration: $duration
      cost: $cost
      categories: $categories
      quick: $quick
    ) {
      _id
    }
  }
`;

export const REMOVE_ELEMENT = gql`
  mutation BmsElementRemove($ids: [String]) {
    bmsElementRemove(ids: $ids)
  }
`;
