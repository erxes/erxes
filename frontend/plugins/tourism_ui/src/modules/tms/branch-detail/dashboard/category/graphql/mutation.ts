import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation BmsTourCategoryAdd(
    $name: String
    $code: String
    $parentId: String
    $branchId: String
    $attachment: AttachmentInput
    $language: String
    $translations: [BmsTourCategoryTranslationInput]
  ) {
    bmsTourCategoryAdd(
      name: $name
      code: $code
      parentId: $parentId
      branchId: $branchId
      attachment: $attachment
      language: $language
      translations: $translations
    ) {
      _id
    }
  }
`;

export const EDIT_CATEGORY = gql`
  mutation BmsTourCategoryEdit(
    $id: String!
    $name: String
    $code: String
    $parentId: String
    $branchId: String
    $attachment: AttachmentInput
    $language: String
    $translations: [BmsTourCategoryTranslationInput]
  ) {
    bmsTourCategoryEdit(
      _id: $id
      name: $name
      code: $code
      parentId: $parentId
      branchId: $branchId
      attachment: $attachment
      language: $language
      translations: $translations
    ) {
      _id
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation BmsTourCategoryRemove($id: String!) {
    bmsTourCategoryRemove(_id: $id)
  }
`;
