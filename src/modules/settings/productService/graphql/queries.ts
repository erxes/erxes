const products = `
  query products($type: String, $categoryId: String, $searchValue: String, $perPage: Int, $page: Int $ids: [String]) {
    products(type: $type, categoryId: $categoryId, searchValue: $searchValue, perPage: $perPage, page: $page ids: $ids) {
      _id
      name
      type
      categoryId
      description
      sku
      createdAt
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
      description
    }
  }
`;

const productCategoriesCount = `
  query productCategoriesTotalCount($parentId: String) {
    productCategoriesTotalCount(parentId: $parentId)
  }
`;

export default {
  products,
  productsCount,
  productCategories,
  productCategoriesCount
};
