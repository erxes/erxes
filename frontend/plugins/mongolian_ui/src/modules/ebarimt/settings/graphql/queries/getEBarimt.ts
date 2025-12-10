import { gql } from '@apollo/client';
export const vatRowFields = `
  _id
  title
  taxType
  taxCode
  percent
  kind
  tabCount
  isBold
  status
`;

export const GET_EBARIMTS = gql`
  query products(
    $type: String
    $bundleId: String
    $categoryId: String
    $tag: String
    $status: String
    $searchValue: String
    $vendorId: String
    $brand: String
    $perPage: Int
    $page: Int
    $ids: [String]
    $excludeIds: Boolean
    $pipelineId: String
    $boardId: String
    $segment: String
    $segmentData: String
    $image: String
  ) {
    products(
      type: $type
      bundleId: $bundleId
      categoryId: $categoryId
      tag: $tag
      status: $status
      searchValue: $searchValue
      vendorId: $vendorId
      brand: $brand
      perPage: $perPage
      page: $page
      ids: $ids
      excludeIds: $excludeIds
      pipelineId: $pipelineId
      boardId: $boardId
      segment: $segment
      segmentData: $segmentData
      image: $image
    ) {
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
        modifiedAt
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
        __typename
      }
      scopeBrandIds
      status
      description
      unitPrice
      barcodes
      variants
      barcodeDescription
      getTags {
        _id
        name
        colorCode
        __typename
      }
      bundleId
      bundle {
        _id
        name
        __typename
      }
      tagIds
      createdAt
      category {
        _id
        code
        name
        __typename
      }
      attachment {
        url
        name
        size
        type
        __typename
      }
      attachmentMore {
        url
        name
        size
        type
        __typename
      }
      pdfAttachment {
        pdf {
          name
          url
          type
          size
          __typename
        }
        pages {
          name
          url
          type
          size
          __typename
        }
        __typename
      }
      uom
      subUoms
      currency
      __typename
    }
  }
`;
