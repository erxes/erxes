const productFields = `
      _id
      name
      type
      code
      categoryId
      description
      categoryName
      sku
      createdAt
`;

const products = `
  query products($type: String, $categoryId: String, $searchValue: String, $perPage: Int, $page: Int $ids: [String]) {
    products(type: $type, categoryId: $categoryId, searchValue: $searchValue, perPage: $perPage, page: $page ids: $ids) {
      ${productFields}
    }
  }
`;

const productsCount = `
  query productsTotalCount($type: String) {
    productsTotalCount(type: $type)
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

export default {
  products,
  productDetail,
  productsCount,
  productCategories,
  productCategoriesCount
};
