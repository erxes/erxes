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
    $language: String
    $translations: [BmsElementTranslationInput]
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
      language: $language
      translations: $translations
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
    $language: String
    $translations: [BmsElementTranslationInput]
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
      language: $language
      translations: $translations
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
