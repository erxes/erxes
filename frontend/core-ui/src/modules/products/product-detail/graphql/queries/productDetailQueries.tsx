import { gql } from '@apollo/client';

export const PRODUCT_DETAIL_QUERY = gql`
  query PRODUCT_DETAIL_QUERY($_id: String) {
    productDetail(_id: $_id) {
      _id
      name
      shortName
      type
      code
      categoryId
      vendorId
      scopeBrandIds
      status
      description
      unitPrice
      barcodes
      variants
      barcodeDescription
      createdAt
      currency
      attachment {
        url
        name
        size
        type
      }
      attachmentMore {
        url
        name
        size
        type
      }
      pdfAttachment {
        pdf {
          name
          url
          type
          size
        }
        pages {
          name
          url
          type
          size
        }
      }
      uom
      subUoms
      customFieldsData
    }
  }
`;
