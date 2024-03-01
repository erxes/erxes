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
  ${isEnabled('contacts') ? vendorField : ``}
  scopeBrandIds
  status,
  description
  unitPrice
  barcodes
  variants
  barcodeDescription
  ${
    isEnabled('tags')
      ? `
    getTags {
      _id
      name
      colorCode
    }
    `
      : ``
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
  uom
  subUoms
  taxType
  taxCode
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
    $segmentData: String
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
      segmentData: $segmentData
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
    }
  }
`;

const uomsTotalCount = `
  query uomsTotalCount {
    uomsTotalCount
  }
`;

// Settings

const accountingsConfigs = `
  query accountingsConfigs {
    accountingsConfigs {
      _id
      code
      value
    }
  }
`;

const productCountByTags = `
  query productCountByTags {
    productCountByTags
  }
`;

const productCategoriesCount = `
  query productCategoriesTotalCount {
    productCategoriesTotalCount
  }
`;

const productsGroupCounts = `
  query productsGroupCounts(
    $segment: String,
    $segmentData: String,
    $only: String
  ) {
    productsGroupCounts(
      segment: $segment,
      segmentData: $segmentData,
      only: $only
    )
  }
`;

const productsCount = `
  query productsTotalCount(
    $type: String,
    $categoryId: String,
    $status: String,
    $tag: String,
    $searchValue: String,
    $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $segment: String,
    $segmentData: String
  ) {
    productsTotalCount(
      type: $type,
      status: $status,
      categoryId: $categoryId,
      tag: $tag,
      searchValue: $searchValue,
      ids: $ids,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      segment: $segment,
      segmentData: $segmentData
    )
  }
`;

const productCategoryDetail = `
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      code
      name
      productCount
    }
  }
`;

export default {
  productFields,
  products,
  productDetail,
  productCategories,
  accountingsConfigs,
  uoms,
  uomsTotalCount,
};
