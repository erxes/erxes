import { gql } from '@apollo/client';

export const categoryAdd = gql`
  mutation productCategoriesAdd(
    $name: String!
    $code: String!
    $parentId: String
    $scopeBrandIds: [String]
    $description: String
    $attachment: AttachmentInput
    $status: String
    $meta: String
    $maskType: String
    $mask: JSON
    $isSimilarity: Boolean
    $similarities: JSON
  ) {
    productCategoriesAdd(
      name: $name
      code: $code
      parentId: $parentId
      scopeBrandIds: $scopeBrandIds
      description: $description
      attachment: $attachment
      status: $status
      meta: $meta
      maskType: $maskType
      mask: $mask
      isSimilarity: $isSimilarity
      similarities: $similarities
    ) {
      _id
      __typename
    }
  }
`;
