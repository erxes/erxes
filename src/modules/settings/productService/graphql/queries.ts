const products = `
  query products($type: String, $searchValue: String, $perPage: Int, $page: Int $ids: [String]) {
    products(type: $type, searchValue: $searchValue, perPage: $perPage, page: $page ids: $ids) {
      _id
      name
      type
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

export default {
  products,
  productsCount
};
