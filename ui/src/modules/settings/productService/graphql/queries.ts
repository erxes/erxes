const productFields = `
  _id
  name
  type
  code
  categoryId
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
    name
  }
  attachment {
    name
    url
    type
    size
  }
`;

const products = `
  query products($type: String, $categoryId: String, $tag: String, $searchValue: String, $perPage: Int, $page: Int $ids: [String]) {
    products(type: $type, categoryId: $categoryId, tag: $tag, searchValue: $searchValue, perPage: $perPage, page: $page ids: $ids) {
      ${productFields}
    }
  }
`;

const productsCount = `
  query productsTotalCount($type: String) {
    productsTotalCount(type: $type)
  }
`;

const productCountByTags = `
  query productCountByTags {
    productCountByTags
  }
`;

const productCategories = `
  query productCategories {
    productCategories {
      _id
      name
      order
      code
      parentId
      description

      isRoot
      productCount
    }
  }
`;

const productCategoriesCount = `
  query productCategoriesTotalCount {
    productCategoriesTotalCount
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

const productCategoryDetail = `
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      name
      productCount
    }
  }
`;

export default {
  products,
  productDetail,
  productCountByTags,
  productsCount,
  productCategories,
  productCategoriesCount,
  productCategoryDetail
};
