import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation BmsTourCategoryAdd(
    $name: String
    $code: String
    $parentId: String
    $attachment: AttachmentInput
  ) {
    bmsTourCategoryAdd(
      name: $name
      code: $code
      parentId: $parentId
      attachment: $attachment
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
    $attachment: AttachmentInput
  ) {
    bmsTourCategoryEdit(
      _id: $id
      name: $name
      code: $code
      parentId: $parentId
      attachment: $attachment
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
