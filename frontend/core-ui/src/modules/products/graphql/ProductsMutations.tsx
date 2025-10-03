import { gql } from '@apollo/client';

const productsAdd = gql`
  mutation productsAdd(
    $name: String
    $shortName: String
    $type: String
    $categoryId: String
    $description: String
    $barcodes: [String]
    $variants: JSON
    $barcodeDescription: String
    $unitPrice: Float
    $code: String
    $customFieldsData: JSON
    $attachment: AttachmentInput
    $attachmentMore: [AttachmentInput]
    $pdfAttachment: PdfAttachmentInput
    $vendorId: String
    $scopeBrandIds: [String]
    $uom: String
    $subUoms: JSON
  ) {
    productsAdd(
      name: $name
      shortName: $shortName
      type: $type
      categoryId: $categoryId
      description: $description
      barcodes: $barcodes
      variants: $variants
      barcodeDescription: $barcodeDescription
      unitPrice: $unitPrice
      code: $code
      customFieldsData: $customFieldsData
      attachment: $attachment
      attachmentMore: $attachmentMore
      pdfAttachment: $pdfAttachment
      vendorId: $vendorId
      scopeBrandIds: $scopeBrandIds
      uom: $uom
      subUoms: $subUoms
    ) {
      _id
      attachment {
        url
      }
      categoryId
      code
      createdAt
      customFieldsData
      description
      tagIds
      name
      shortName
      uom
      unitPrice
      type
      vendor {
        _id
        primaryName
      }
    }
  }
`;

const categoryRemove = gql`
  mutation productCategoriesRemove($_id: String!) {
    productCategoriesRemove(_id: $_id)
}`

const categoryEdit = gql`
  mutation productCategoriesEdit($_id: String!, $name: String!, $code: String!, $parentId: String, $scopeBrandIds: [String], $description: String, $attachment: AttachmentInput, $status: String, $meta: String, $maskType: String, $mask: JSON, $isSimilarity: Boolean, $similarities: JSON) {
    productCategoriesEdit(
      _id: $_id
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
  }
}
`
const productsEdit = gql`
  mutation ProductsEdit(
    $_id: String!
    $name: String
    $shortName: String
    $categoryId: String
    $type: String
    $description: String
    $unitPrice: Float
    $code: String
    $customFieldsData: JSON
    $vendorId: String
    $uom: String
    $barcodeDescription: String
    $barcodes: [String]
  ) {
    productsEdit(
      _id: $_id
      name: $name
      shortName: $shortName
      categoryId: $categoryId
      type: $type
      description: $description
      unitPrice: $unitPrice
      code: $code
      customFieldsData: $customFieldsData
      vendorId: $vendorId
      barcodes: $barcodes 
      uom: $uom
      barcodeDescription: $barcodeDescription
    ) {
      _id
    }
  }
`;

export const productsMutations = { productsEdit, productsAdd , categoryEdit , categoryRemove };
