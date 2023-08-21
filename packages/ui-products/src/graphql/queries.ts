import { isEnabled } from '@erxes/ui/src/utils/core';

const productFields = `
  _id
  name
  type
  code
  categoryId
  vendorId
  description
  unitPrice
  barcodes
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
    $searchValue: String,
    $perPage: Int,
    $page: Int $ids: [String],
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
      searchValue: $searchValue,
      perPage: $perPage,
      page: $page ids: $ids,
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
  query productCategories($status: String) {
    productCategories(status: $status) {
      _id
      name
      order
      code
      parentId
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

const productsConfigs = `
  query productsConfigs {
    productsConfigs {
      _id
      code
      value
    }
  }
`;

export default {
  productFields,
  products,
  productDetail,
  productCategories,
  productsConfigs,
  uoms,
  uomsTotalCount
};
