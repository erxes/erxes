import { gql } from '@apollo/client';

export const CREATE_AMENITY = gql`
  mutation BmsAmenityAdd(
    $name: String
    $icon: String
    $quick: Boolean
    $branchId: String
    $language: String
    $translations: [BmsElementTranslationInput]
  ) {
    bmsElementAdd(
      name: $name
      icon: $icon
      quick: $quick
      branchId: $branchId
      language: $language
      translations: $translations
    ) {
      _id
    }
  }
`;

export const EDIT_AMENITY = gql`
  mutation BmsAmenityEdit(
    $id: String!
    $name: String
    $icon: String
    $quick: Boolean
    $language: String
    $translations: [BmsElementTranslationInput]
  ) {
    bmsElementEdit(
      _id: $id
      name: $name
      icon: $icon
      quick: $quick
      language: $language
      translations: $translations
    ) {
      _id
    }
  }
`;

export const REMOVE_AMENITY = gql`
  mutation BmsAmenityRemove($ids: [String]) {
    bmsElementRemove(ids: $ids)
  }
`;
