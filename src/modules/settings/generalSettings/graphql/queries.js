const products = `
  query products($type: String) {
    products(type: $type) {
      _id
      name
      type
      description
      sku
      createdAt
    }
  }
`;

export default {
  products
};
