import { isEnabled } from '@erxes/ui/src/utils/core';

const vendorField = `
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
  }
`;

const productFields = `
  _id
  name
  shortName
  type
  code
  categoryId
  vendorId
  ${vendorField}
  scopeBrandIds
  status,
  description
  unitPrice
  barcodes
  variants
  barcodeDescription

  getTags {
    _id
    name
    colorCode
  }
    
  tagIds
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
  currency
`;

const products = `
  query products(
    $type: String,
    $categoryId: String,
    $tag: String,
    $status: String,
    $searchValue: String,
    $vendorId: String,
    $brand: String,
    $perPage: Int,
    $page: Int
    $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $segment: String,
    $segmentData: String,
    $image: String,
  ) {
    products(
      type: $type,
      categoryId: $categoryId,
      tag: $tag,
      status: $status,
      searchValue: $searchValue,
      vendorId: $vendorId,
      brand: $brand,
      perPage: $perPage,
      page: $page
      ids: $ids,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      segment: $segment,
      segmentData: $segmentData,
      image: $image,
    ) {
      ${productFields}
    }
  }
`;

const productDetail = `
  query productDetail($_id: String) {
    productDetail(_id: $_id) {
      ${productFields}
      customFieldsData
    }
  }
`;

const productCategories = `
  query productCategories($status: String, $brand: String) {
    productCategories(status: $status, brand: $brand) {
      _id
      name
      order
      code
      parentId
      scopeBrandIds
      description
      status
      meta
      attachment {
        name
        url
        type
        size
      }

      isRoot
      productCount
      maskType
      mask
      isSimilarity
      similarities
    }
  }
`;

// UOM

const uoms = `
  query uoms {
    uoms {
      _id
      name
      code
      createdAt
      isForSubscription
      subscriptionConfig
      timely
    }
  }
`;

const uomsTotalCount = `
  query uomsTotalCount {
    uomsTotalCount
  }
`;

// Settings

const productsConfigs = `
  query productsConfigs {
    productsConfigs {
      _id
      code
      value
    }
  }
`;

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

export default {
  productFields,
  products,
  productDetail,
  productCategories,
  productsConfigs,
  uoms,
  uomsTotalCount,
  configs,
};
