const productFields = `
  _id
  name
  type
  code
  categoryId
  vendorId
  description
  unitPrice
  sku
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
  supply
  productCount
  minimiumCount
  uomId
  subUoms
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
    $boardId: String
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
      boardId: $boardId
    ) {
      ${productFields}
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
  productCategories,
  productsConfigs,
  uoms
};
