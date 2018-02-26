const products = `
  query products($type: String, $perPage: Int, $page: Int) {
    products(type: $type, perPage: $perPage, page: $page) {
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
