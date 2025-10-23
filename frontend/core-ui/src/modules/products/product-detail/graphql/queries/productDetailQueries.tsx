import { gql } from '@apollo/client';

export const productCategoryDetail = gql`
  query productDetail($_id: String) {
    productDetail(_id: $_id) {
      _id
      name
      shortName
      type
      code
      categoryId
      vendorId
      vendor {
        _id
        avatar
        businessType
        code
        createdAt
        customFieldsData
        description
        emails
        industry
        isSubscribed
        links
        location
        mergedIds
        updatedAt
        names
        ownerId
        parentCompanyId
        phones
        plan
        primaryEmail
        primaryName
        primaryPhone
        score
        size
        tagIds
        trackedData
        website
      }
      scopeBrandIds
      status
      description
      unitPrice
      barcodes
      variants
      barcodeDescription
      createdAt
      category {
        _id
        code
        name
      }
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
